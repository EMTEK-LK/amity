'use client';

import { Camera, Mic, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
interface ConsentGateProps {
  onStartFull: () => void;
  onStartWithoutCamera: () => void;
  onCancel: () => void;
}

export function ConsentGate({ onStartFull, onStartWithoutCamera, onCancel }: ConsentGateProps) {
  const items: { icon: typeof Mic; title: string; detail: string }[] = [
    {
      icon: Mic,
      title: 'Microphone',
      detail: 'Voice conversation adapts pacing and support — session only.',
    },
    {
      icon: Camera,
      title: 'Camera (optional)',
      detail: 'Optional visible cue awareness — not diagnosis. You can skip camera.',
    },
    {
      icon: Shield,
      title: 'Crisis escalation',
      detail: 'If safety risk is detected, normal coaching pauses and human support options appear.',
    },
  ];

  return (
    <Card variant="elevated" className="mx-auto max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-2 text-[var(--amity-primary)]">
          <Sparkles className="h-5 w-5" aria-hidden />
          <CardTitle>Before we begin</CardTitle>
        </div>
        <CardDescription>
          You control this session. Amity uses optional signals to adapt support — never to
          diagnose you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--amity-text)]">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--amity-text-muted)]">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-[var(--amity-text-muted)]">
          Your recovery conversation stays private. Company dashboards only use aggregated
          wellbeing signals.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button variant="primary" size="lg" fullWidth className="sm:flex-1" onClick={onStartFull}>
            Start private recovery session
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className="sm:flex-1"
            onClick={onStartWithoutCamera}
          >
            Continue without camera
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
