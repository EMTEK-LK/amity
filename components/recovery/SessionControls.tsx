'use client';

import { Pause, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface SessionControlsProps {
  sessionStarted: boolean;
  paused: boolean;
  crisis: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onComplete: () => void;
}

export function SessionControls({
  sessionStarted,
  paused,
  crisis,
  onStart,
  onPause,
  onResume,
  onReset,
  onComplete,
}: SessionControlsProps) {
  return (
    <Card variant="elevated">
      <CardContent className="space-y-2 pt-5">
        {!sessionStarted ? (
          <Button variant="primary" size="lg" fullWidth onClick={onStart}>
            <Play className="h-4 w-4" aria-hidden />
            Start session
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={paused ? onResume : onPause}
              disabled={crisis}
            >
              {paused ? (
                <>
                  <Play className="h-4 w-4" aria-hidden /> Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" aria-hidden /> Pause
                </>
              )}
            </Button>
            <ButtonLink
              href="/user/summary"
              variant="primary"
              size="lg"
              fullWidth
              onClick={onComplete}
            >
              Complete session
            </ButtonLink>
          </>
        )}
        <ButtonLink href="/user/crisis" variant={crisis ? 'danger' : 'ghost'} size="md" fullWidth>
          <ShieldAlert className="h-4 w-4" aria-hidden />
          Open Crisis Support
        </ButtonLink>
        <Button variant="ghost" size="sm" fullWidth onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset session
        </Button>
      </CardContent>
    </Card>
  );
}
