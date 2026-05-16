'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { ConsentGate } from '@/components/recovery/ConsentGate';
import { RecoveryHeader } from '@/components/recovery/RecoveryHeader';
import { AvatarSessionPanel } from '@/components/recovery/AvatarSessionPanel';
import { ConversationPanel } from '@/components/recovery/ConversationPanel';
import { VoiceOutputPanel } from '@/components/recovery/VoiceOutputPanel';
import { SharedContextPanel } from '@/components/recovery/SharedContextPanel';
import { SignalStatusPanel } from '@/components/recovery/SignalStatusPanel';
import { SafetyStatusPanel } from '@/components/recovery/SafetyStatusPanel';
import { QuickModeButtons } from '@/components/recovery/QuickModeButtons';
import { SessionControls } from '@/components/recovery/SessionControls';
import { mergeConsent, saveStoredConsent } from '@/lib/consent-manager';
import { captureFacialSignal } from '@/lib/facial-awareness';
import { createVoiceSessionSnapshot } from '@/lib/voice-session';
import {
  getDemoResponseForMessage,
  pickVoiceMode,
  type RecoveryModeId,
  type ElevenLabsVoiceMode,
} from '@/lib/demo-recovery-responses';
import { loadRecoveryContext, saveRecoveryContext } from '@/lib/recovery-session-bridge';
import { prepareRecoverySession } from '@/lib/recovery-orchestrator';
import { prepareCrisisEscalation } from '@/lib/crisis-escalation';
import { updateContextFromVoiceSignal } from '@/lib/session-context';
import type { SharedSessionContext } from '@/types/session-context';
import type {
  AvatarStatus,
  ConversationMessage,
  RecoverySafetyState,
  RecoverySessionStatus,
} from '@/types/recovery-room';
import { generateSupportResponse } from '@/lib/gemini';
import { synthesizeRecoveryVoice } from '@/lib/elevenlabs';

function newMessage(role: 'user' | 'assistant', content: string): ConversationMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

function modeLabel(mode: RecoveryModeId): string {
  const labels: Record<RecoveryModeId, string> = {
    breathe_first: 'Breathe first',
    talk_it_out: 'Talk it out',
    prepare_next_step: 'Prepare next step',
    reset_before_call: 'Reset before next call',
    human_support: 'Human support',
  };
  return labels[mode];
}

export default function RecoveryPage() {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<RecoverySessionStatus>('consent');
  const [selectedMode, setSelectedMode] = useState<RecoveryModeId>('talk_it_out');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<SharedSessionContext>(() => loadRecoveryContext());
  const [safetyState, setSafetyState] = useState<RecoverySafetyState>('normal');
  const [voiceMode, setVoiceMode] = useState<ElevenLabsVoiceMode>('calm_supportive');
  const [avatarStatus, setAvatarStatus] = useState<AvatarStatus>('ready');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const crisis = safetyState === 'crisis' || sessionStatus === 'crisis';

  useEffect(() => {
    if (!sessionStarted || paused || crisis) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [sessionStarted, paused, crisis]);

  const applyConsent = useCallback((withCamera: boolean) => {
    const consent = mergeConsent(context.consent, {
      cameraEnabled: withCamera,
      microphoneEnabled: true,
      facialAwarenessEnabled: withCamera,
      voiceAnalysisEnabled: true,
      crisisEscalationEnabled: true,
    });
    setCameraEnabled(withCamera);
    setMicEnabled(true);
    setConsentAccepted(true);
    setSessionStatus('active');
    setSessionStarted(true);

    let ctx: SharedSessionContext = { ...context, consent };
    const facial = captureFacialSignal({
      consent,
      expressionHint: withCamera ? 'neutral' : undefined,
      simulated: true,
    });
    const voice = createVoiceSessionSnapshot({
      consent,
      voiceStateHint: 'calm',
      simulated: true,
    });
    if (facial) ctx = { ...ctx, facialSignal: facial };
    if (voice) ctx = updateContextFromVoiceSignal(ctx, voice);

    const plan = prepareRecoverySession(ctx);
    setContext(ctx);
    saveRecoveryContext(ctx);
    saveStoredConsent(consent);
    setVoiceMode(plan.elevenLabsVoiceMode as ElevenLabsVoiceMode);
    setAvatarStatus('ready');
    setMessages([
      newMessage(
        'assistant',
        'Welcome back. This is your private recovery space. Share what feels heavy, or choose a quick message below.'
      ),
    ]);
  }, [context]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!sessionStarted || paused) return;

      setMessages((prev) => [...prev, newMessage('user', text)]);
      setAvatarStatus('listening');

      const demo = getDemoResponseForMessage(text, selectedMode);
      setVoiceMode(demo.voiceMode);

      let ctx = { ...context };
      if (demo.crisis) {
        prepareCrisisEscalation(ctx);
        const crisisCtx: SharedSessionContext = {
          ...ctx,
          safetyLevel: 'crisis',
          riskLevel: 'crisis',
          recommendedAction: 'crisis_safety_flow',
        };
        setContext(crisisCtx);
        setSafetyState('crisis');
        setSessionStatus('crisis');
        setAvatarStatus('crisis');
        setLastResponse(demo.text);
        setMessages((prev) => [...prev, newMessage('assistant', demo.text)]);
        saveRecoveryContext(crisisCtx);
        return;
      }

      setAvatarStatus('responding');
      const gemini = await generateSupportResponse({
        context: text,
        sessionContext: ctx,
      });
      const responseText = demo.text || gemini.supportText;

      ctx = {
        ...ctx,
        stressLevel: Math.max(20, ctx.stressLevel - 4),
        voiceState: 'calm',
      };
      setContext(ctx);
      saveRecoveryContext(ctx);

      await synthesizeRecoveryVoice({ text: responseText, voiceMode: demo.voiceMode });

      setLastResponse(responseText);
      setMessages((prev) => [...prev, newMessage('assistant', responseText)]);
      setAvatarStatus('ready');

      if (ctx.stressLevel > 60) setSafetyState('recovery_needed');
      else if (ctx.stressLevel > 40) setSafetyState('elevated');
      else setSafetyState('normal');
      setVoiceMode(pickVoiceMode(false, ctx.stressLevel));
    },
    [context, paused, selectedMode, sessionStarted]
  );

  const handleReset = () => {
    const fresh = loadRecoveryContext();
    setContext(fresh);
    setConsentAccepted(false);
    setCameraEnabled(false);
    setMicEnabled(false);
    setSessionStarted(false);
    setPaused(false);
    setSessionStatus('consent');
    setMessages([]);
    setSafetyState('normal');
    setAvatarStatus('ready');
    setLastResponse(null);
    setElapsed(0);
    setVoiceMode('calm_supportive');
  };

  if (!consentAccepted) {
    return (
      <PageContainer className="pb-10">
        <RecoveryHeader
          sessionMode="Awaiting consent"
          sessionStatus="consent"
          safetyState="normal"
        />
        <div className="mt-6">
          <ConsentGate
            onStartFull={() => applyConsent(true)}
            onStartWithoutCamera={() => applyConsent(false)}
            onCancel={() => {
              window.location.href = '/user/dashboard';
            }}
          />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/user/trigger-demo" className="text-[var(--amity-primary)] hover:underline">
            Return to Trigger Demo
          </Link>
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-10">
      <RecoveryHeader
        sessionMode={modeLabel(selectedMode)}
        sessionStatus={sessionStatus}
        safetyState={safetyState}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-4 lg:col-span-7 xl:col-span-8">
          <AvatarSessionPanel
            status={avatarStatus}
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            elapsedSeconds={elapsed}
            sessionActive={sessionStarted && !paused}
          />
          <QuickModeButtons
            selected={selectedMode}
            onSelect={setSelectedMode}
            disabled={crisis || paused}
          />
          <ConversationPanel
            messages={messages}
            crisis={crisis}
            disabled={!sessionStarted || paused}
            onSend={handleSend}
          />
          <div className="lg:hidden">
            <VoiceOutputPanel
              voiceMode={voiceMode}
              lastResponse={lastResponse}
              crisis={crisis}
            />
          </div>
          <div className="lg:hidden">
            <SessionControls
              sessionStarted={sessionStarted}
              paused={paused}
              crisis={crisis}
              onStart={() => setSessionStarted(true)}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
              onReset={handleReset}
              onComplete={() => {}}
            />
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-5 xl:col-span-4">
          <div className="hidden lg:block">
            <SessionControls
              sessionStarted={sessionStarted}
              paused={paused}
              crisis={crisis}
              onStart={() => setSessionStarted(true)}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
              onReset={handleReset}
              onComplete={() => {}}
            />
          </div>
          <SharedContextPanel context={context} />
          <SignalStatusPanel
            context={context}
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            sessionStarted={sessionStarted}
          />
          <SafetyStatusPanel safetyState={safetyState} crisis={crisis} />
          <div className="hidden lg:block">
            <VoiceOutputPanel
              voiceMode={voiceMode}
              lastResponse={lastResponse}
              crisis={crisis}
            />
          </div>
        </aside>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--amity-text-muted)]">
        Your recovery conversation stays private. Company dashboards only use aggregated
        wellbeing signals.
      </p>
    </PageContainer>
  );
}
