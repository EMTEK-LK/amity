'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Mic,
  MicOff,
  PhoneOff,
  ShieldAlert,
  ShieldCheck,
  Video,
} from 'lucide-react';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  ProgressBar,
  SectionHeader,
  StatusChip,
} from '@/components/ui';

const prompts = [
  'Take a slow breath in… and let it go.',
  'You are safe here. This space is just for you.',
  "Let's name what happened, without judging it.",
  'Notice your shoulders softening as you exhale.',
  'You handled a hard moment. That takes strength.',
  "When you're ready, we'll close gently.",
];

const SESSION_SECONDS = 60;

export default function RecoveryPage() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [muted, setMuted] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setElapsed((e) => {
        if (e >= SESSION_SECONDS) {
          setRunning(false);
          return SESSION_SECONDS;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const progress = Math.round((elapsed / SESSION_SECONDS) * 100);
  const done = elapsed >= SESSION_SECONDS;
  const promptIndex = Math.min(
    prompts.length - 1,
    Math.floor((elapsed / SESSION_SECONDS) * prompts.length)
  );
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Private session"
        title="Recovery Room"
        description="A calm, private AI video companion guides a short emotional reset. The conversation never leaves this session."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card variant="elevated" className="overflow-hidden">
            <div className="relative flex aspect-video items-center justify-center bg-[var(--amity-bg-subtle)]">
              <div
                aria-hidden
                className={`absolute h-44 w-44 rounded-full bg-[var(--amity-glow)] blur-2xl ${
                  running && !done ? 'animate-pulse' : ''
                }`}
              />
              <div className="relative flex flex-col items-center gap-3 text-center">
                <span
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)] shadow-[var(--amity-shadow)] ${
                    running && !done ? 'animate-pulse' : ''
                  }`}
                >
                  <Video className="h-8 w-8" aria-hidden />
                </span>
                <p className="max-w-xs px-4 text-sm font-medium leading-relaxed text-[var(--amity-text)]">
                  {done ? 'Session complete. Well done.' : prompts[promptIndex]}
                </p>
              </div>
              <div className="absolute left-4 top-4">
                <StatusChip status={done ? 'stable' : 'in_recovery'} />
              </div>
              <div className="absolute right-4 top-4">
                <Badge variant="success">Private</Badge>
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-[var(--amity-overlay)] px-2.5 py-1 text-xs font-medium tabular-nums text-white">
                {mm}:{ss}
              </div>
            </div>
            <CardContent className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setMuted((m) => !m)}
                disabled={done}
              >
                {muted ? (
                  <MicOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden />
                )}
                {muted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setRunning(false);
                  setElapsed(SESSION_SECONDS);
                }}
                disabled={done}
              >
                <PhoneOff className="h-4 w-4" aria-hidden />
                End session
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Session progress</CardTitle>
              <CardDescription>A short guided reset, around a minute.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ProgressBar
                label="Recovery readiness"
                value={progress}
                tone={done ? 'success' : 'primary'}
              />
              <ProgressBar
                label="Calm signal"
                value={Math.min(100, 30 + progress * 0.65)}
                tone="success"
              />
            </CardContent>
          </Card>

          {done ? (
            <Card variant="elevated">
              <CardContent className="space-y-3 text-center">
                <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
                  Your reset is complete. Here is a private recap of how you shifted.
                </p>
                <ButtonLink href="/user/summary" variant="primary" size="lg" fullWidth>
                  View recovery summary
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
              </CardContent>
            </Card>
          ) : (
            <Card variant="soft">
              <CardContent className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-success)]">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
                  This session is private to you. The company only ever receives aggregated,
                  anonymized wellbeing signals.
                </p>
              </CardContent>
            </Card>
          )}

          <Card variant="default">
            <CardContent className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-danger)]">
                <ShieldAlert className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
                <span className="font-medium text-[var(--amity-text)]">Safety:</span> in a
                future release, in-call video and audio signals will be monitored. If severe
                distress or crisis language is detected, coaching stops and Crisis Safety Mode
                activates automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
