'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MicrophonePermissionStatus } from '@/hooks/useMicrophonePermission';
import type { SpeechTranscriptStatus } from '@/hooks/useSpeechTranscript';
import type { CameraStatus } from '@/hooks/useRecoveryMediaSession';
import type { FacialAwarenessStatus } from '@/types/facial-awareness';
import type { GeminiProviderStatus } from '@/types/agent';
import type { SharedSessionContext } from '@/types/session-context';

interface SignalStatusPanelProps {
  context: SharedSessionContext;
  cameraEnabled: boolean;
  micEnabled: boolean;
  micStatus?: MicrophonePermissionStatus;
  cameraStatus?: CameraStatus;
  transcriptStatus?: SpeechTranscriptStatus;
  sessionStarted: boolean;
  facialStatus?: FacialAwarenessStatus;
  geminiProvider?: GeminiProviderStatus | null;
}

interface SignalRow {
  title: string;
  status: string;
  source: string;
  detail: string;
  variant: 'primary' | 'neutral' | 'warning';
}

function micStatusLabel(status: MicrophonePermissionStatus | undefined): string {
  switch (status) {
    case 'granted':
      return 'Active';
    case 'requesting':
      return 'Requesting…';
    case 'denied':
      return 'Denied';
    case 'unavailable':
      return 'Unavailable';
    case 'error':
      return 'Error';
    default:
      return 'Off';
  }
}

function facialStatusLabel(status: FacialAwarenessStatus | undefined): string {
  switch (status) {
    case 'running':
      return 'Running (local)';
    case 'no_face':
      return 'No face';
    case 'models_missing':
      return 'Models missing';
    case 'waiting_for_camera':
      return 'Waiting…';
    case 'permission_denied':
      return 'Denied';
    default:
      return status ?? 'Off';
  }
}

function transcriptStatusLabel(status: SpeechTranscriptStatus | undefined): string {
  switch (status) {
    case 'listening':
      return 'Listening';
    case 'interrupted':
      return 'Interrupted';
    case 'unsupported':
      return 'Unsupported';
    case 'error':
      return 'Error';
    case 'stopped':
      return 'Stopped';
    default:
      return 'Idle';
  }
}

export function SignalStatusPanel({
  context,
  cameraEnabled,
  micEnabled,
  micStatus,
  cameraStatus,
  transcriptStatus,
  sessionStarted,
  facialStatus,
  geminiProvider,
}: SignalStatusPanelProps) {
  const facialLive = context.facialSignal && !context.facialSignal.simulated;
  const facial: SignalRow = cameraEnabled
    ? {
        title: 'Facial awareness',
        status: facialStatusLabel(facialStatus),
        source: 'Local face-api.js',
        detail: context.facialSignal
          ? `Cue: ${context.facialSignal.expression} · summarized only`
          : 'Enable camera — models in public/models',
        variant: facialLive && facialStatus === 'running' ? 'primary' : 'neutral',
      }
    : {
        title: 'Facial awareness',
        status: 'Paused',
        source: 'Optional',
        detail: 'Camera not enabled',
        variant: 'neutral',
      };

  const voice: SignalRow = micEnabled
    ? {
        title: 'Voice / transcript',
        status: micStatusLabel(micStatus),
        source: 'Microphone · Web Speech (demo)',
        detail:
          micStatus === 'granted'
            ? `State: ${context.voiceState} · transcript sent as summary`
            : 'Grant mic or use text input',
        variant: micStatus === 'granted' ? 'primary' : 'warning',
      }
    : {
        title: 'Voice / transcript',
        status: 'Off',
        source: 'Microphone',
        detail: 'Enable mic for speech-to-text demo',
        variant: 'neutral',
      };

  const trigger: SignalRow = {
    title: 'Trigger signal',
    status: context.triggerType ? 'Loaded' : 'Baseline',
    source: context.source === 'session_init' ? 'Session start' : String(context.source),
    detail: context.triggerType ?? 'No trigger from demo',
    variant: context.triggerType ? 'warning' : 'neutral',
  };

  const agent: SignalRow = {
    title: 'Gemini agent',
    status: geminiProvider
      ? geminiProvider === 'real'
        ? 'Real'
        : geminiProvider === 'safety'
          ? 'Safety'
          : geminiProvider === 'not_configured'
            ? 'No API key'
            : 'Error'
      : sessionStarted
        ? 'Ready'
        : 'Idle',
    source: 'POST /api/agent/respond',
    detail: 'Text only · voice disabled until Step 7',
    variant: geminiProvider === 'real' ? 'primary' : 'neutral',
  };

  const camera: SignalRow = {
    title: 'Camera',
    status:
      cameraStatus === 'active'
        ? 'Active'
        : cameraStatus === 'denied'
          ? 'Denied'
          : cameraStatus === 'unavailable'
            ? 'Unavailable'
            : 'Off',
    source: 'Local only',
    detail: 'Used for optional facial cues — never sent as video',
    variant: cameraStatus === 'active' ? 'primary' : 'neutral',
  };

  const transcript: SignalRow = {
    title: 'Transcript',
    status: transcriptStatusLabel(transcriptStatus),
    source: 'Web Speech API (browser)',
    detail:
      transcriptStatus === 'unsupported'
        ? 'Unavailable here — use text input'
        : 'Final speech text sent to Gemini',
    variant: transcriptStatus === 'listening' ? 'primary' : 'neutral',
  };

  const voiceOut: SignalRow = {
    title: 'Voice output',
    status: 'Disabled',
    source: 'ElevenLabs',
    detail: 'Disabled until Step 7',
    variant: 'neutral',
  };

  const rows = [trigger, camera, voice, transcript, facial, agent, voiceOut];

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Signal pipelines</CardTitle>
        <p className="text-xs text-[var(--amity-text-muted)]">
          Facial runs locally; agent receives summaries only
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.title}
            className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-[var(--amity-text)]">{row.title}</p>
              <Badge variant={row.variant}>{row.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--amity-primary)]">{row.source}</p>
            <p className="mt-0.5 text-xs text-[var(--amity-text-muted)]">{row.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
