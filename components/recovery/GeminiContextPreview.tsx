'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { GeminiProviderStatus } from '@/types/agent';

interface GeminiContextPreviewProps {
  preview: Record<string, unknown> | null;
  geminiProvider?: GeminiProviderStatus;
}

export function GeminiContextPreview({ preview, geminiProvider }: GeminiContextPreviewProps) {
  const [open, setOpen] = useState(false);

  if (!preview) return null;

  const rows: { label: string; value: string }[] = [
    { label: 'Message source', value: String(preview.source ?? 'typed_input') },
    { label: 'User message', value: String(preview.userMessage ?? '—') },
    { label: 'Transcript', value: String(preview.transcript ?? '—') },
    { label: 'Facial cue', value: String(preview.facialExpression ?? '—') },
    {
      label: 'Confidence',
      value:
        preview.facialConfidence != null
          ? `${Math.round(Number(preview.facialConfidence) * 100)}%`
          : '—',
    },
    { label: 'Engagement', value: String(preview.engagement ?? '—') },
    { label: 'Facial quality', value: String(preview.facialSignalQuality ?? '—') },
    { label: 'Camera', value: String(preview.cameraStatus ?? '—') },
    { label: 'Microphone', value: String(preview.micStatus ?? '—') },
    { label: 'Stress', value: String(preview.stressLevel ?? '—') },
    { label: 'Risk', value: String(preview.riskLevel ?? '—') },
    { label: 'Safety', value: String(preview.safetyLevel ?? '—') },
  ];

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <div>
            <CardTitle className="text-sm">Gemini context preview</CardTitle>
            <p className="text-[10px] text-[var(--amity-text-muted)]">
              Summarized payload only — no video or images
            </p>
          </div>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
        {geminiProvider && (
          <Badge
            variant={
              geminiProvider === 'real'
                ? 'success'
                : geminiProvider === 'safety'
                  ? 'neutral'
                  : 'danger'
            }
            className="mt-2 w-fit"
          >
            Gemini:{' '}
            {geminiProvider === 'not_configured' ? 'not configured' : geminiProvider}
          </Badge>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-2 pt-0">
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            {rows.map((r) => (
              <div key={r.label} className="contents">
                <dt className="text-[var(--amity-text-muted)]">{r.label}</dt>
                <dd className="truncate font-medium text-[var(--amity-text)]">{r.value}</dd>
              </div>
            ))}
          </dl>
          <pre className="max-h-28 overflow-auto rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg)] p-2 font-mono text-[10px] text-[var(--amity-text-muted)]">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
