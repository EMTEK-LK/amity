'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { mapVoiceMode } from '@/lib/elevenlabs';
import type { AgentAudioStatus } from '@/types/agent';

interface VoiceOutputPanelProps {
  audioUrl?: string | null;
  voiceStatus?: AgentAudioStatus | null;
  voiceMode?: string | null;
  placeholder?: boolean;
}

export function VoiceOutputPanel({
  audioUrl,
  voiceStatus,
  voiceMode,
}: VoiceOutputPanelProps) {
  /* Audio plays in AvatarSessionPanel so voice and avatar stay in sync */

  const ready = voiceStatus === 'ready' && Boolean(audioUrl);
  const label = voiceMode ? mapVoiceMode(voiceMode) : 'Calm · supportive';

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <VoiceHeader ready={ready} />
        <p className="text-xs text-[var(--amity-text-muted)]">Spoken recovery replies</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant={ready ? 'primary' : 'neutral'}>
          {ready
            ? 'Voice ready'
            : voiceStatus === 'mock_ready'
              ? 'Voice pending'
              : voiceStatus === 'error'
                ? 'Voice unavailable'
                : 'Voice not configured'}
        </Badge>
        <p className="text-sm text-[var(--amity-text-muted)]">
          {ready
            ? `Playing recovery line · ${label}`
            : 'Voice response will be available after voice output is enabled.'}
        </p>
        {audioUrl && voiceStatus === 'ready' ? (
          <p className="text-xs text-[var(--amity-primary)]">Playing in the session above</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function VoiceHeader({ ready }: { ready: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ready ? (
        <Volume2 className="h-4 w-4 text-[var(--amity-primary)]" aria-hidden />
      ) : (
        <VolumeX className="h-4 w-4 text-[var(--amity-text-muted)]" aria-hidden />
      )}
      <CardTitle className="text-base">Voice output</CardTitle>
    </div>
  );
}
