'use client';

import { ArrowRight, RotateCcw, ShieldAlert, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { buildSessionContextFromScenario } from '@/lib/demo-trigger-scenarios';
import { saveRecoveryContext } from '@/lib/recovery-session-bridge';
import type { TriggerScenario } from '@/types/trigger';

interface TriggerDemoActionsProps {
  scenario: TriggerScenario | null;
  onReset: () => void;
  sticky?: boolean;
}

export function TriggerDemoActions({
  scenario,
  onReset,
  sticky = false,
}: TriggerDemoActionsProps) {
  const hasSelection = scenario !== null;
  const isCrisis = scenario?.isCrisis ?? false;

  const cta = (
    <div className="space-y-3">
      {isCrisis ? (
        <ButtonLink href="/user/crisis" variant="danger" size="lg" fullWidth>
          <ShieldAlert className="h-4 w-4" aria-hidden />
          Open Crisis Safety Flow
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      ) : (
        <ButtonLink
          href="/user/recovery"
          variant="primary"
          size="lg"
          fullWidth
          className={!hasSelection ? 'pointer-events-none opacity-50' : undefined}
          tabIndex={hasSelection ? undefined : -1}
          aria-disabled={!hasSelection}
          onClick={() => {
            if (scenario) saveRecoveryContext(buildSessionContextFromScenario(scenario));
          }}
        >
          <Zap className="h-4 w-4" aria-hidden />
          Open Recovery Room
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      )}

      {!hasSelection && (
        <p className="text-center text-xs text-[var(--amity-text-muted)]">
          Select a scenario first
        </p>
      )}
      {hasSelection && !isCrisis && (
        <p className="text-center text-xs text-[var(--amity-text-muted)]">
          Private recovery session · demo signal only
        </p>
      )}
      {hasSelection && isCrisis && (
        <p className="text-center text-xs text-[var(--amity-danger)]">
          Crisis mode requires human escalation
        </p>
      )}

      <Button variant="ghost" size="sm" fullWidth onClick={onReset} disabled={!hasSelection}>
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Reset simulation
      </Button>
    </div>
  );

  if (sticky) {
    return (
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--amity-border)] bg-[var(--amity-surface)]/95 p-4 backdrop-blur-md lg:hidden',
          'pb-[max(1rem,env(safe-area-inset-bottom))]'
        )}
      >
        {cta}
      </div>
    );
  }

  return cta;
}
