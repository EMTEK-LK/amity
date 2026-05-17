'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneCall, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmployeeContextCard } from '@/components/trigger/EmployeeContextCard';
import { EmotionalTwinPanel } from '@/components/trigger/EmotionalTwinPanel';
import { JsonPayloadPreview } from '@/components/trigger/JsonPayloadPreview';
import { RecoveryChannelsPanel } from '@/components/trigger/RecoveryChannelsPanel';
import { RiskEnginePanel } from '@/components/trigger/RiskEnginePanel';
import { ScenarioCard } from '@/components/trigger/ScenarioCard';
import { SignalTimeline } from '@/components/trigger/SignalTimeline';
import { TriggerDemoActions } from '@/components/trigger/TriggerDemoActions';
import { IncomingRecoveryCall } from '@/components/recovery/IncomingRecoveryCall';
import {
  TRIGGER_SCENARIOS,
  buildSessionContextFromScenario,
  buildSignalTimeline,
  buildTriggerPayload,
  defaultStableState,
  getTriggerScenarioById,
  scenarioToTwinState,
} from '@/lib/demo-trigger-scenarios';
import { saveRecoveryContext } from '@/lib/recovery-session-bridge';
import { saveRecoveryHandoffContext } from '@/lib/recovery-session-handoff';
import { DEMO_EMPLOYEE } from '@/lib/demo-identities';

type CallState = 'idle' | 'ringing' | 'declined';

const AUTO_CALL_DELAY_MS = 800;

export default function TriggerDemoPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoCall, setAutoCall] = useState(true);
  const [callState, setCallState] = useState<CallState>('idle');
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = selectedId ? getTriggerScenarioById(selectedId) ?? null : null;
  const twin = scenario ? scenarioToTwinState(scenario) : defaultStableState;
  const timeline = scenario ? buildSignalTimeline(scenario) : [];
  const payload = scenario ? buildTriggerPayload(scenario) : null;

  const statusType = twin.statusType;
  const isCrisis = scenario?.isCrisis ?? false;
  const isHighRisk = !isCrisis && scenario?.riskLevel === 'high';

  const firstName = DEMO_EMPLOYEE.name.split(' ')[0];

  // Auto-ring on a high-risk (non-crisis) scenario when auto-call is on.
  useEffect(() => {
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    setCallState('idle');
    if (isHighRisk && autoCall) {
      ringTimerRef.current = setTimeout(
        () => setCallState('ringing'),
        AUTO_CALL_DELAY_MS
      );
    }
    return () => {
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    };
  }, [selectedId, isHighRisk, autoCall]);

  const handleReset = () => {
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    setSelectedId(null);
    setCallState('idle');
  };

  const handleAnswer = () => {
    if (!scenario) return;
    saveRecoveryHandoffContext(scenario);
    saveRecoveryContext(buildSessionContextFromScenario(scenario));
    setCallState('idle');
    router.push(`/user/recovery?source=trigger-demo&scenario=${scenario.id}`);
  };

  const handleDecline = () => setCallState('declined');

  return (
    <>
      <PageContainer className="pb-28 lg:pb-14">
        <SectionHeader
          eyebrow="Demo tool"
          title="Trigger Simulation"
          description="Pick a workplace signal to see how Amity assesses it and prepares a private recovery session."
        />

        <Card variant="soft" className="mt-4">
          <CardContent className="flex flex-wrap items-center gap-2 py-3 text-sm text-[var(--amity-text-muted)]">
            <span className="font-medium text-[var(--amity-text)]">Demo signal</span>
            <span className="hidden sm:inline">·</span>
            <span>
              These scenarios stand in for future workplace and wearable sources. Real
              integrations are future scope.
            </span>
            <Badge variant="neutral" className="ml-auto shrink-0">
              Demo
            </Badge>
          </CardContent>
        </Card>

        {/* Desktop: 3-column / Mobile: stacked */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left — employee + scenarios */}
          <div className="space-y-6 lg:col-span-5">
            <EmployeeContextCard statusType={statusType} />

            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[var(--amity-text)]">
                  Trigger scenarios
                </h2>
                <Badge variant="info">{TRIGGER_SCENARIOS.length} signals</Badge>
              </div>
              <div className="grid gap-3">
                {TRIGGER_SCENARIOS.map((s) => (
                  <ScenarioCard
                    key={s.id}
                    scenario={s}
                    selected={selectedId === s.id}
                    onSelect={() => setSelectedId(s.id)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Middle — emotional twin */}
          <div className="lg:col-span-4">
            <EmotionalTwinPanel twin={twin} hasSelection={!!scenario} />
          </div>

          {/* Right — risk, recovery call, channels, actions (desktop) */}
          <div className="space-y-4 lg:col-span-3">
            <RiskEnginePanel
              scenario={scenario}
              riskScore={twin.riskScore}
              statusType={statusType}
            />

            {scenario && (
              <Card variant="default">
                <CardContent className="space-y-3">
                  {isCrisis ? (
                    <>
                      <p className="text-sm font-medium text-[var(--amity-text)]">
                        Amity response: Crisis safety flow recommended
                      </p>
                      <p className="text-xs text-[var(--amity-text-muted)]">
                        Channel: Crisis support · normal coaching is paused
                      </p>
                      <ButtonLink
                        href="/user/crisis"
                        variant="danger"
                        size="md"
                        fullWidth
                      >
                        <ShieldAlert className="h-4 w-4" aria-hidden />
                        Open Crisis Safety Flow
                      </ButtonLink>
                    </>
                  ) : isHighRisk ? (
                    <>
                      <p className="text-sm font-medium text-[var(--amity-text)]">
                        Amity response: Recovery call recommended
                      </p>
                      <p className="text-xs text-[var(--amity-text-muted)]">
                        Amity can start a private in-app recovery call when a high-pressure
                        signal is detected.
                      </p>
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => setCallState('ringing')}
                      >
                        <PhoneCall className="h-4 w-4" aria-hidden />
                        Simulate incoming call
                      </Button>
                      <label className="flex items-center gap-2 text-xs text-[var(--amity-text-muted)]">
                        <input
                          type="checkbox"
                          checked={autoCall}
                          onChange={(e) => setAutoCall(e.target.checked)}
                          className="h-4 w-4 rounded border-[var(--amity-border)] accent-[var(--amity-primary)]"
                        />
                        Auto-call on high-risk signal
                      </label>
                      {callState === 'declined' && (
                        <p className="text-xs text-[var(--amity-text-muted)]">
                          Recovery call dismissed. You can start recovery anytime.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-[var(--amity-text)]">
                        Amity response: Recovery session available
                      </p>
                      <p className="text-xs text-[var(--amity-text-muted)]">
                        This signal is within a supportive range — start a private recovery
                        session whenever you are ready.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <RecoveryChannelsPanel />
            <div className="hidden lg:block">
              <TriggerDemoActions scenario={scenario} onReset={handleReset} />
            </div>
            <div className="hidden lg:block">
              <SignalTimeline items={timeline} />
            </div>
          </div>
        </div>

        {/* Mobile-only: timeline (channels shown in stacked right column above) */}
        <div className="mt-6 lg:hidden">
          <SignalTimeline items={timeline} />
        </div>

        {/* JSON — full width bottom */}
        <div className="mt-6">
          <JsonPayloadPreview payload={payload} />
        </div>
      </PageContainer>

      {/* Mobile sticky CTA */}
      <TriggerDemoActions scenario={scenario} onReset={handleReset} sticky />

      <IncomingRecoveryCall
        open={callState === 'ringing'}
        scenario={scenario}
        employeeName={firstName}
        onAnswer={handleAnswer}
        onDecline={handleDecline}
        onOpenCrisis={() => setCallState('idle')}
      />
    </>
  );
}
