'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { TriggerPayload } from '@/types/trigger';

interface JsonPayloadPreviewProps {
  payload: TriggerPayload | null;
  defaultOpen?: boolean;
}

export function JsonPayloadPreview({
  payload,
  defaultOpen = false,
}: JsonPayloadPreviewProps) {
  const [open, setOpen] = useState(defaultOpen);

  const json = payload
    ? JSON.stringify(
        {
          employeeId: payload.employeeId,
          source: payload.source,
          triggerType: payload.triggerType,
          emotionSignal: payload.emotionSignal,
          stressScore: payload.stressScore,
          heartRate: payload.heartRate,
          riskLevel: payload.riskLevel,
          recommendedAction: payload.recommendedAction,
        },
        null,
        2
      )
    : null;

  return (
    <Card variant="soft" className="overflow-hidden">
      <CardHeader className="pb-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]"
          aria-expanded={open}
        >
          <div>
            <CardTitle className="text-base">Signal payload</CardTitle>
            <p className="mt-0.5 text-xs text-[var(--amity-text-muted)]">
              Demo JSON · future API readiness
            </p>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-[var(--amity-text-muted)] transition-transform',
              open && 'rotate-180'
            )}
            aria-hidden
          />
        </button>
      </CardHeader>
      {(open || defaultOpen) && (
        <CardContent className="pt-4">
          {json ? (
            <pre className="overflow-x-auto rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--amity-text-muted)] sm:text-sm">
              {json}
            </pre>
          ) : (
            <p className="text-sm text-[var(--amity-text-muted)]">
              Select a scenario to preview the outbound signal payload.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
