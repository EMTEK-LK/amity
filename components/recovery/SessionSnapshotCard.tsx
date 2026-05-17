'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { BadgeVariant } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import type { CameraStatus } from '@/hooks/useRecoveryMediaSession';
import type { MicrophonePermissionStatus } from '@/hooks/useMicrophonePermission';
import type { SpeechTranscriptStatus } from '@/hooks/useSpeechTranscript';
import type { FacialAwarenessStatus } from '@/types/facial-awareness';
import type { GeminiProviderStatus } from '@/types/agent';

interface SnapshotRow {
  label: string;
  value: string;
  variant: BadgeVariant;
}

interface SessionSnapshotCardProps {
  cameraStatus?: CameraStatus;
  micStatus?: MicrophonePermissionStatus;
  transcriptStatus?: SpeechTranscriptStatus;
  facialStatus?: FacialAwarenessStatus;
  geminiProvider?: GeminiProviderStatus | null;
  voiceStatus?: string | null;
  avatarReady?: boolean;
  sessionStarted: boolean;
}

function cameraRow(status: CameraStatus | undefined): SnapshotRow {
  if (status === 'active') return { label: 'Camera', value: 'Active', variant: 'success' };
  if (status === 'denied') return { label: 'Camera', value: 'Off', variant: 'neutral' };
  if (status === 'unavailable')
    return { label: 'Camera', value: 'Unavailable', variant: 'neutral' };
  return { label: 'Camera', value: 'Off', variant: 'neutral' };
}

function micRow(status: MicrophonePermissionStatus | undefined): SnapshotRow {
  if (status === 'granted') return { label: 'Microphone', value: 'Active', variant: 'success' };
  if (status === 'requesting')
    return { label: 'Microphone', value: 'Connecting', variant: 'warning' };
  return { label: 'Microphone', value: 'Off', variant: 'neutral' };
}

function transcriptRow(status: SpeechTranscriptStatus | undefined): SnapshotRow {
  if (status === 'listening')
    return { label: 'Transcript', value: 'Listening', variant: 'success' };
  if (status === 'interrupted')
    return { label: 'Transcript', value: 'Paused', variant: 'warning' };
  if (status === 'unsupported')
    return { label: 'Transcript', value: 'Use text', variant: 'neutral' };
  return { label: 'Transcript', value: 'Paused', variant: 'neutral' };
}

function facialRow(status: FacialAwarenessStatus | undefined): SnapshotRow {
  if (status === 'running')
    return { label: 'Facial signal', value: 'Running', variant: 'success' };
  if (status === 'no_face')
    return { label: 'Facial signal', value: 'No face', variant: 'warning' };
  if (status === 'models_missing')
    return { label: 'Facial signal', value: 'Unavailable', variant: 'neutral' };
  return { label: 'Facial signal', value: 'Off', variant: 'neutral' };
}

function geminiRow(provider: GeminiProviderStatus | null | undefined): SnapshotRow {
  if (provider === 'real') return { label: 'Recovery agent', value: 'Ready', variant: 'success' };
  if (provider === 'safety')
    return { label: 'Recovery agent', value: 'Safety', variant: 'warning' };
  if (provider === 'not_configured')
    return { label: 'Recovery agent', value: 'Not configured', variant: 'neutral' };
  if (provider === 'error')
    return { label: 'Recovery agent', value: 'Quota reached', variant: 'danger' };
  return { label: 'Recovery agent', value: 'Idle', variant: 'neutral' };
}

function voiceRow(status: string | null | undefined): SnapshotRow {
  if (status === 'ready') return { label: 'Voice', value: 'Ready', variant: 'success' };
  if (status === 'mock_ready' || status === 'pending')
    return { label: 'Voice', value: 'Pending', variant: 'neutral' };
  return { label: 'Voice', value: 'Not configured', variant: 'neutral' };
}

export function SessionSnapshotCard({
  cameraStatus,
  micStatus,
  transcriptStatus,
  facialStatus,
  geminiProvider,
  voiceStatus,
  avatarReady,
  sessionStarted,
}: SessionSnapshotCardProps) {
  const rows: SnapshotRow[] = [
    cameraRow(cameraStatus),
    micRow(micStatus),
    transcriptRow(transcriptStatus),
    facialRow(facialStatus),
    geminiRow(geminiProvider),
    voiceRow(voiceStatus),
    {
      label: 'Avatar',
      value: avatarReady ? 'Ready' : sessionStarted ? 'Pending' : 'Idle',
      variant: avatarReady ? 'success' : 'neutral',
    },
  ];

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Session snapshot</CardTitle>
        <p className="text-xs text-[var(--amity-text-muted)]">
          Live status of your private session
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-[var(--amity-border)] py-0">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
          >
            <span className="text-[var(--amity-text-muted)]">{row.label}</span>
            <Badge variant={row.variant}>{row.value}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
