'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { TriggerTimelineItem } from '@/types/trigger';

interface SignalTimelineProps {
  items: TriggerTimelineItem[];
  emptyMessage?: string;
}

export function SignalTimeline({
  items,
  emptyMessage = 'Select a scenario to view the signal timeline.',
}: SignalTimelineProps) {
  return (
    <Card variant="default">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Signal timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--amity-text-muted)]">{emptyMessage}</p>
        ) : (
          <ol className="relative space-y-0 border-l border-[var(--amity-border)] pl-4">
            {items.map((item, i) => (
              <li key={item.id} className={cn('pb-4 last:pb-0', i === 0 && 'pt-0')}>
                <span className="absolute -left-[9px] mt-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)]">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                </span>
                <p className="text-sm font-medium text-[var(--amity-text)]">{item.label}</p>
                {item.detail && (
                  <p className="mt-0.5 text-xs text-[var(--amity-text-muted)]">{item.detail}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
