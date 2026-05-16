'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
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
import {
  TRIGGER_SCENARIOS,
  buildSignalTimeline,
  buildTriggerPayload,
  defaultStableState,
  getTriggerScenarioById,
  scenarioToTwinState,
} from '@/lib/demo-trigger-scenarios';

export default function TriggerDemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scenario = selectedId ? getTriggerScenarioById(selectedId) ?? null : null;
  const twin = scenario ? scenarioToTwinState(scenario) : defaultStableState;
  const timeline = scenario ? buildSignalTimeline(scenario) : [];
  const payload = scenario ? buildTriggerPayload(scenario) : null;

  const statusType = twin.statusType;

  const handleReset = () => setSelectedId(null);

  return (
    <>
      <PageContainer className="pb-28 lg:pb-14">
        <SectionHeader
          eyebrow="Employee demo"
          title="Trigger Demo"
          description="Simulate workplace, wearable, voice, and optional visible cues — then see how Amity merges signals into a private recovery session."
        />

        <Card variant="soft" className="mt-4">
          <CardContent className="flex flex-wrap items-center gap-2 py-3 text-sm text-[var(--amity-text-muted)]">
            <span className="font-medium text-[var(--amity-text)]">Demo signal only</span>
            <span className="hidden sm:inline">·</span>
            <span>
              MVP simulates trigger, voice, and facial-awareness pipelines into shared session
              context. Real integrations require consent and are future scope.
            </span>
            <Badge variant="neutral" className="ml-auto shrink-0">
              Future integration
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

          {/* Right — risk, channels, actions (desktop) */}
          <div className="space-y-4 lg:col-span-3">
            <RiskEnginePanel
              scenario={scenario}
              riskScore={twin.riskScore}
              statusType={statusType}
            />
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
    </>
  );
}
