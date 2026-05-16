'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { mapVoiceModeLabel, type ElevenLabsVoiceMode } from '@/lib/demo-recovery-responses';

interface VoiceOutputPanelProps {
  voiceMode: ElevenLabsVoiceMode | string;
  lastResponse: string | null;
  crisis: boolean;
}

export function VoiceOutputPanel({ voiceMode, lastResponse, crisis }: VoiceOutputPanelProps) {
  const [playing, setPlaying] = useState(false);

  const bars = 12;

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[var(--amity-primary)]" aria-hidden />
          <CardTitle className="text-base">Voice output</CardTitle>
        </div>
        <p className="text-xs text-[var(--amity-text-muted)]">ElevenLabs emotional voice · placeholder</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-[var(--amity-text-muted)]">Mode</span>
          <span className="font-medium text-[var(--amity-text)]">
            {mapVoiceModeLabel(voiceMode)}
          </span>
        </div>
        <div className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
            Status
          </p>
          <p className="mt-1 text-sm text-[var(--amity-text)]">
            {playing ? 'Voice preview playing…' : lastResponse ? 'Voice preview ready' : 'Waiting for response'}
          </p>
          <div className="mt-3 flex h-8 items-end justify-center gap-0.5">
            {Array.from({ length: bars }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-[var(--amity-primary)]"
                animate={
                  playing
                    ? { height: [4, 8 + (i % 4) * 4, 4] }
                    : { height: lastResponse ? 6 : 3 }
                }
                transition={{
                  duration: 0.4,
                  repeat: playing ? Infinity : 0,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>
        <Button
          variant={crisis ? 'danger' : 'secondary'}
          size="md"
          fullWidth
          disabled={!lastResponse}
          onClick={() => {
            setPlaying(true);
            setTimeout(() => setPlaying(false), 2200);
          }}
        >
          <Play className="h-4 w-4" aria-hidden />
          Play voice preview
        </Button>
      </CardContent>
    </Card>
  );
}
