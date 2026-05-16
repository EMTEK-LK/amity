'use client';

import { ShieldAlert } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import type { RecoverySafetyState } from '@/types/recovery-room';
import type { StatusType } from '@/components/ui/StatusChip';

interface SafetyStatusPanelProps {
  safetyState: RecoverySafetyState;
  crisis: boolean;
}

function toChip(state: RecoverySafetyState): StatusType {
  if (state === 'crisis') return 'crisis';
  if (state === 'recovery_needed') return 'recovery_needed';
  if (state === 'elevated') return 'support_recommended';
  return 'stable';
}

const LABELS: Record<RecoverySafetyState, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  recovery_needed: 'Recovery Needed',
  crisis: 'Crisis Mode',
};

export function SafetyStatusPanel({ safetyState, crisis }: SafetyStatusPanelProps) {
  return (
    <Card variant={crisis ? 'danger' : 'default'}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Safety</CardTitle>
          <StatusChip status={toChip(safetyState)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-[var(--amity-text)]">{LABELS[safetyState]}</p>
        {crisis ? (
          <>
            <p className="text-sm leading-relaxed text-[var(--amity-danger)]">
              Normal coaching is paused. Amity is preparing human support options. You are not
              alone.
            </p>
            <ButtonLink href="/user/crisis" variant="danger" size="lg" fullWidth>
              <ShieldAlert className="h-4 w-4" aria-hidden />
              Open Crisis Safety Flow
            </ButtonLink>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-[var(--amity-text-muted)]">
            Session text is checked for safety signals. Crisis language routes to human
            escalation — never AI-only support.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
