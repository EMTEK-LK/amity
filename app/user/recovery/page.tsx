'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { GeminiContextPreview } from '@/components/recovery/GeminiContextPreview';
import { useRecoveryMediaSession } from '@/hooks/useRecoveryMediaSession';
import { useRecoveryVoicePlayback } from '@/hooks/useRecoveryVoicePlayback';
import {
  buildAgentSessionContext,
  buildGeminiContextPreview,
} from '@/lib/agent-session-context';
import { RecoveryAgentError, sendRecoveryAgentMessage } from '@/lib/client/recovery-agent';
import { mergeConsent, saveStoredConsent } from '@/lib/consent-manager';
import { createVoiceSessionSnapshot } from '@/lib/voice-session';
import type { RecoveryModeId } from '@/lib/demo-recovery-responses';
import { loadRecoveryContext, saveRecoveryContext } from '@/lib/recovery-session-bridge';
import { prepareRecoverySession } from '@/lib/recovery-orchestrator';
import { unlockAudioPlayback } from '@/lib/unlock-audio-playback';
import { recoveryDebug } from '@/lib/recovery-debug';
import { prepareCrisisEscalation } from '@/lib/crisis-escalation';
import { updateContextFromFacialSignal, updateContextFromVoiceSignal } from '@/lib/session-context';
import type {
  AgentAvatarOutput,
  AgentMessageSource,
  AgentVoiceOutput,
  GeminiProviderStatus,
} from '@/types/agent';
import type { SharedSessionContext } from '@/types/session-context';
import type {
  AvatarStatus,
  ConversationMessage,
  RecoverySafetyState,
  RecoverySessionStatus,
} from '@/types/recovery-room';

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

function formatAssistantMessage(response: string, nextQuestion?: string | null): string {
  if (!nextQuestion) return response;
  return `${response}\n\n${nextQuestion}`;
}

const AUTO_SEND_DEBOUNCE_MS = 2000;

export default function RecoveryPage() {
  const session = useRecoveryMediaSession();

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<RecoveryModeId>('talk_it_out');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<SharedSessionContext>(() => loadRecoveryContext());
  const [safetyState, setSafetyState] = useState<RecoverySafetyState>('normal');
  const [elapsed, setElapsed] = useState(0);
  const [sending, setSending] = useState(false);
  const [paused, setPaused] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [agentError, setAgentError] = useState<string | null>(null);
  const [geminiProvider, setGeminiProvider] = useState<GeminiProviderStatus | null>(null);
  const [geminiPreview, setGeminiPreview] = useState<Record<string, unknown> | null>(null);
  const [voiceOutput, setVoiceOutput] = useState<AgentVoiceOutput | null>(null);
  const [avatarOutput, setAvatarOutput] = useState<AgentAvatarOutput | null>(null);

  const crisis = safetyState === 'crisis' || session.sessionState === 'crisis';
  const lastAutoSentRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });

  const liveKitAvatar =
    avatarOutput?.displayMode === 'livekit' && avatarOutput?.placeholder === false;

  // LiveKit mode: one Web Audio path in publishAudioToRoom (avoids echo).
  useRecoveryVoicePlayback(
    voiceOutput?.audioUrl,
    consentAccepted &&
      !paused &&
      voiceOutput?.status === 'ready' &&
      !liveKitAvatar
  );

  useEffect(() => {
    if (!voiceOutput) return;
    recoveryDebug('RecoveryPage', 'voiceOutput updated', {
      status: voiceOutput.status,
      voiceMode: voiceOutput.voiceMode,
      placeholder: voiceOutput.placeholder,
      hasAudioUrl: Boolean(voiceOutput.audioUrl),
      audioUrlLength: voiceOutput.audioUrl?.length ?? 0,
    });
  }, [voiceOutput]);

  useEffect(() => {
    if (!avatarOutput) return;
    recoveryDebug('RecoveryPage', 'avatarOutput updated', {
      displayMode: avatarOutput.displayMode,
      placeholder: avatarOutput.placeholder,
      agentId: avatarOutput.agentId,
      agentName: avatarOutput.agentName,
    });
  }, [avatarOutput]);

  const sessionStatus: RecoverySessionStatus = crisis
    ? 'crisis'
    : paused
      ? 'paused'
      : consentAccepted
        ? 'active'
        : 'consent';

  const avatarStatus: AvatarStatus = crisis
    ? 'crisis'
    : session.sessionState === 'processing' || session.sessionState === 'responding'
      ? 'responding'
      : session.sessionState === 'active_listening' && !paused
        ? 'listening'
        : 'ready';

  // Camera signal → shared context
  useEffect(() => {
    if (!session.facialSignal || !session.withCamera) return;
    if (session.facialSignal.signalQuality === 'unavailable') return;
    setContext((prev) => {
      const next = updateContextFromFacialSignal(prev, session.facialSignal);
      saveRecoveryContext(next);
      return next;
    });
  }, [session.facialSignal, session.withCamera]);

  // Live transcript preview into the draft (not yet sent)
  useEffect(() => {
    const combined = [session.transcript, session.interimTranscript]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (combined && session.sessionState === 'active_listening') {
      setDraftMessage(combined);
    }
  }, [session.transcript, session.interimTranscript, session.sessionState]);

  useEffect(() => {
    if (!consentAccepted || paused || crisis) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [consentAccepted, paused, crisis]);

  const activateCrisis = useCallback(
    (ctx: SharedSessionContext, responseText: string) => {
      prepareCrisisEscalation(ctx);
      const crisisCtx: SharedSessionContext = {
        ...ctx,
        safetyLevel: 'crisis',
        riskLevel: 'crisis',
        recommendedAction: 'crisis_safety_flow',
      };
      setContext(crisisCtx);
      setSafetyState('crisis');
      setGeminiProvider('safety');
      session.markCrisis();
      setMessages((prev) => [...prev, newMessage('assistant', responseText)]);
      saveRecoveryContext(crisisCtx);
    },
    [session]
  );

  const handleSend = useCallback(
    async (text: string, source: AgentMessageSource) => {
      const trimmed = text.trim();
      if (!consentAccepted || paused || sending || crisis || !trimmed) return;

      setAgentError(null);
      setMessages((prev) => [...prev, newMessage('user', trimmed)]);
      setSending(true);
      session.markProcessing();

      const ctx = { ...context };
      const transcript =
        source === 'voice_transcript'
          ? trimmed
          : [session.transcript, trimmed].filter(Boolean).join(' ').trim() || undefined;

      const sessionPayload = buildAgentSessionContext(ctx, {
        transcript,
        facialEnabled: session.withCamera,
        facialStatus: session.facialStatus,
        facialSignal: session.facialSignal,
        selectedRecoveryMode: selectedMode,
      });

      setGeminiPreview(
        buildGeminiContextPreview(trimmed, sessionPayload, {
          source,
          cameraStatus: session.cameraStatus,
          micStatus: session.microphoneStatus,
        })
      );

      try {
        const result = await sendRecoveryAgentMessage({
          sessionId: ctx.sessionId,
          employeeId: ctx.employeeId,
          userMessage: trimmed,
          source,
          sessionContext: sessionPayload,
          selectedRecoveryMode: selectedMode,
        });

        session.markResponding();
        setGeminiProvider(result.provider.gemini);
        if (result.geminiContextPreview) setGeminiPreview(result.geminiContextPreview);
        if (result.voice) setVoiceOutput(result.voice);
        if (result.avatar) setAvatarOutput(result.avatar);
        recoveryDebug('RecoveryPage', 'agent respond ok', {
          voiceStatus: result.voice?.status,
          hasAudioUrl: Boolean(result.voice?.audioUrl),
          avatarMode: result.avatar?.displayMode,
        });

        const assistantText = formatAssistantMessage(result.response, result.nextQuestion);

        if (result.crisis) {
          activateCrisis(ctx, assistantText);
          return;
        }

        const nextCtx: SharedSessionContext = {
          ...ctx,
          stressLevel: Math.max(20, ctx.stressLevel - 4),
          voiceState: 'calm',
          safetyLevel: 'normal',
          recommendedAction:
            (result.recommendedAction as SharedSessionContext['recommendedAction']) ??
            ctx.recommendedAction,
        };
        setContext(nextCtx);
        saveRecoveryContext(nextCtx);
        setMessages((prev) => [...prev, newMessage('assistant', assistantText)]);
        session.markActive();

        if (nextCtx.stressLevel > 60) setSafetyState('recovery_needed');
        else if (nextCtx.stressLevel > 40) setSafetyState('elevated');
        else setSafetyState('normal');
      } catch (err) {
        setAgentError(err instanceof Error ? err.message : 'Could not reach Amity agent');
        if (err instanceof RecoveryAgentError && err.geminiProvider) {
          setGeminiProvider(err.geminiProvider);
        }
        session.markActive();
      } finally {
        setSending(false);
        setDraftMessage('');
      }
    },
    [
      activateCrisis,
      consentAccepted,
      context,
      crisis,
      paused,
      selectedMode,
      sending,
      session,
    ]
  );

  // Auto-send finalized speech segments (debounced + de-duplicated)
  useEffect(() => {
    if (!consentAccepted || paused || crisis || sending) return;
    const history = session.finalTranscriptHistory;
    if (history.length === 0) return;
    const latest = history[history.length - 1]?.trim();
    if (!latest) return;
    const now = Date.now();
    const last = lastAutoSentRef.current;
    if (latest === last.text) return;
    if (now - last.at < AUTO_SEND_DEBOUNCE_MS) return;
    lastAutoSentRef.current = { text: latest, at: now };
    void handleSend(latest, 'voice_transcript');
  }, [
    session.finalTranscriptHistory,
    consentAccepted,
    paused,
    crisis,
    sending,
    handleSend,
  ]);

  const applyConsent = useCallback(
    (withCamera: boolean) => {
      unlockAudioPlayback();
      const consent = mergeConsent(context.consent, {
        cameraEnabled: withCamera,
        microphoneEnabled: true,
        facialAwarenessEnabled: withCamera,
        voiceAnalysisEnabled: true,
        crisisEscalationEnabled: true,
      });
      setConsentAccepted(true);
      setPaused(false);

      let ctx: SharedSessionContext = {
        ...context,
        consent,
        facialSignal: null,
        facialConfidence: null,
        facialSignalQuality: null,
        facialUpdatedAt: null,
      };
      const voice = createVoiceSessionSnapshot({
        consent,
        voiceStateHint: 'calm',
        simulated: true,
      });
      if (voice) ctx = updateContextFromVoiceSignal(ctx, voice);

      prepareRecoverySession(ctx);
      setContext(ctx);
      saveRecoveryContext(ctx);
      saveStoredConsent(consent);
      setMessages([
        newMessage(
          'assistant',
          'Welcome back. This is your private recovery space. Speak when you are ready, or type below.'
        ),
      ]);
      session.startSession({ withCamera });

      void fetch('/api/recovery/bootstrap')
        .then((r) => r.json())
        .then((data: { avatar?: AgentAvatarOutput }) => {
          if (data.avatar) setAvatarOutput(data.avatar);
        })
        .catch(() => {
          /* avatar stays placeholder */
        });
    },
    [context, session]
  );

  const handleReset = () => {
    const fresh = loadRecoveryContext();
    setContext(fresh);
    setConsentAccepted(false);
    setPaused(false);
    setMessages([]);
    setSafetyState('normal');
    setElapsed(0);
    setDraftMessage('');
    setAgentError(null);
    setGeminiProvider(null);
    setGeminiPreview(null);
    setVoiceOutput(null);
    setAvatarOutput(null);
    session.stopSession();
  };

  const cameraActive = session.withCamera && session.cameraStatus === 'active';
  const micActive = session.microphoneStatus === 'granted';

  if (!consentAccepted) {
    return (
      <PageContainer className="pb-10">
        <RecoveryHeader
          sessionMode="Ready to start"
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

      {(agentError || session.errorMessage) && (
        <p
          className="mt-4 rounded-lg border border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] px-3 py-2 text-sm text-[var(--amity-danger)]"
          role="status"
        >
          {agentError ?? session.errorMessage}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-4 lg:col-span-7 xl:col-span-8">
          <AvatarSessionPanel
            sessionId={context.sessionId}
            status={avatarStatus}
            cameraEnabled={cameraActive}
            micEnabled={micActive}
            elapsedSeconds={elapsed}
            sessionActive={consentAccepted && !paused}
            displayMode={avatarOutput?.displayMode ?? 'stage'}
            embedUrl={avatarOutput?.embedUrl}
            sessionUrl={avatarOutput?.sessionUrl}
            agentName={avatarOutput?.agentName}
            avatarPlaceholder={avatarOutput?.placeholder ?? true}
            audioUrl={voiceOutput?.audioUrl}
            isSpeaking={voiceOutput?.status === 'ready'}
          />
          <QuickModeButtons
            selected={selectedMode}
            onSelect={setSelectedMode}
            disabled={crisis || paused}
          />
          <ConversationPanel
            messages={messages}
            crisis={crisis}
            disabled={!consentAccepted || paused}
            sending={sending || session.sessionState === 'processing'}
            onSend={(text) => handleSend(text, 'typed_input')}
            speechSupported={session.speechSupported}
            speechListening={session.sessionState === 'active_listening' && !paused}
            speechHint={session.speechMessage}
            draftValue={draftMessage}
            onDraftChange={setDraftMessage}
            geminiProvider={geminiProvider}
            voiceStatus={voiceOutput?.status ?? null}
            transcriptPreview={
              session.interimTranscript || session.transcript
                ? [session.transcript, session.interimTranscript].filter(Boolean).join(' ')
                : null
            }
          />
          <div className="lg:hidden">
            <VoiceOutputPanel
              audioUrl={voiceOutput?.audioUrl}
              voiceStatus={voiceOutput?.status}
              voiceMode={voiceOutput?.voiceMode}
              placeholder={voiceOutput?.placeholder}
            />
          </div>
          <div className="lg:hidden">
            <SessionControls
              sessionStarted={consentAccepted}
              paused={paused}
              crisis={crisis}
              onStart={() => setPaused(false)}
              onPause={() => {
                setPaused(true);
                session.pauseSession();
              }}
              onResume={() => {
                setPaused(false);
                session.resumeSession();
              }}
              onReset={handleReset}
              onComplete={() => {}}
            />
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-5 xl:col-span-4">
          <div className="hidden lg:block">
            <SessionControls
              sessionStarted={consentAccepted}
              paused={paused}
              crisis={crisis}
              onStart={() => setPaused(false)}
              onPause={() => {
                setPaused(true);
                session.pauseSession();
              }}
              onResume={() => {
                setPaused(false);
                session.resumeSession();
              }}
              onReset={handleReset}
              onComplete={() => {}}
            />
          </div>
          <SharedContextPanel
            context={context}
            facialEnabled={session.withCamera}
            facialVideoRef={session.videoRef}
            facialStatus={session.facialStatus}
            facialSignal={session.facialSignal}
            facialError={session.errorMessage}
            geminiProvider={geminiProvider}
          />
          <GeminiContextPreview
            preview={geminiPreview}
            geminiProvider={geminiProvider ?? undefined}
          />
          <SignalStatusPanel
            context={context}
            cameraEnabled={cameraActive}
            micEnabled={micActive}
            micStatus={session.microphoneStatus}
            cameraStatus={session.cameraStatus}
            transcriptStatus={session.transcriptStatus}
            sessionStarted={consentAccepted}
            facialStatus={session.facialStatus}
            geminiProvider={geminiProvider}
            voiceStatus={voiceOutput?.status ?? null}
            avatarDisplayMode={avatarOutput?.displayMode ?? null}
          />
          <SafetyStatusPanel safetyState={safetyState} crisis={crisis} />
          <div className="hidden lg:block">
            <VoiceOutputPanel
              audioUrl={voiceOutput?.audioUrl}
              voiceStatus={voiceOutput?.status}
              voiceMode={voiceOutput?.voiceMode}
              placeholder={voiceOutput?.placeholder}
            />
          </div>
        </aside>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--amity-text-muted)]">
        Summarized transcript and facial cues go to the recovery agent — never raw camera video or
        mic audio. Voice: ElevenLabs. Avatar: Beyond Presence when configured.
      </p>
    </PageContainer>
  );
}
