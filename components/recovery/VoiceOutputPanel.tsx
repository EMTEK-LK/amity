'use client';

import { VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

/** Step 7 placeholder — ElevenLabs intentionally disabled in Step 6A */
export function VoiceOutputPanel() {
  return (
    <Card variant="soft" className="opacity-90">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <VolumeX className="h-4 w-4 text-[var(--amity-text-muted)]" aria-hidden />
          <CardTitle className="text-base">Voice output</CardTitle>
        </div>
        <p className="text-xs text-[var(--amity-text-muted)]">ElevenLabs · Step 7</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="neutral">Voice layer disabled until Step 7</Badge>
        <p className="text-sm text-[var(--amity-text-muted)]">
          Step 6 connects face signal and transcript to Gemini for text responses only. Audio
          generation will return after Gemini responses are stable.
        </p>
      </CardContent>
    </Card>
  );
}
