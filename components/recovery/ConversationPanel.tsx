'use client';

import { useEffect, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { SAMPLE_USER_MESSAGES } from '@/lib/demo-recovery-responses';
import type { AgentAudioStatus, GeminiProviderStatus } from '@/types/agent';
import type { ConversationMessage } from '@/types/recovery-room';

interface ConversationPanelProps {
  messages: ConversationMessage[];
  crisis: boolean;
  disabled: boolean;
  sending?: boolean;
  onSend: (text: string) => void;
  speechSupported?: boolean;
  speechListening?: boolean;
  speechHint?: string | null;
  onStartSpeech?: () => void;
  onStopSpeech?: () => void;
  draftValue?: string;
  onDraftChange?: (value: string) => void;
  geminiProvider?: GeminiProviderStatus | null;
  voiceStatus?: AgentAudioStatus | null;
  transcriptPreview?: string | null;
}

export function ConversationPanel({
  messages,
  crisis,
  disabled,
  sending = false,
  onSend,
  speechSupported = false,
  speechListening = false,
  speechHint,
  onStartSpeech,
  onStopSpeech,
  draftValue,
  onDraftChange,
  geminiProvider,
  voiceStatus,
  transcriptPreview,
}: ConversationPanelProps) {
  const [localInput, setLocalInput] = useState('');
  const input = draftValue ?? localInput;
  const setInput = onDraftChange ?? setLocalInput;

  useEffect(() => {
    if (draftValue !== undefined) setLocalInput(draftValue);
  }, [draftValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled || sending) return;
    onSend(text);
    setInput('');
  };

  const statusLine = crisis
    ? 'Normal coaching paused'
    : sending
      ? 'Amity is reading your session context…'
      : voiceStatus === 'ready'
        ? 'Amity will speak the reply with ElevenLabs voice.'
        : voiceStatus === 'mock_ready'
          ? 'Add ELEVENLABS_API_KEY for spoken replies.'
          : 'Type or speak to Amity.';

  return (
    <Card variant="default" className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Session conversation</CardTitle>
            <p className="text-xs text-[var(--amity-text-muted)]">{statusLine}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {geminiProvider && (
              <Badge
                variant={
                  geminiProvider === 'real'
                    ? 'success'
                    : geminiProvider === 'safety'
                      ? 'neutral'
                      : 'danger'
                }
              >
                Gemini:{' '}
                {geminiProvider === 'not_configured'
                  ? 'not configured'
                  : geminiProvider}
              </Badge>
            )}
            {voiceStatus && (
              <Badge
                variant={
                  voiceStatus === 'ready'
                    ? 'success'
                    : voiceStatus === 'mock_ready'
                      ? 'neutral'
                      : voiceStatus === 'disabled'
                        ? 'neutral'
                        : 'danger'
                }
              >
                Voice:{' '}
                {voiceStatus === 'ready'
                  ? 'ElevenLabs'
                  : voiceStatus === 'mock_ready'
                    ? 'not configured'
                    : voiceStatus}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-[200px] flex-1 flex-col gap-4">
        <div
          className="max-h-56 flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] p-3 sm:max-h-64"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <p className="text-center text-sm text-[var(--amity-text-muted)]">
              Choose a quick message or type below to begin.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto bg-[var(--amity-primary-muted)] text-[var(--amity-text)]'
                    : 'mr-auto border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-text)]'
                )}
              >
                {m.content}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_USER_MESSAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={disabled || sending}
              onClick={() => onSend(s.text)}
              className="min-h-10 rounded-full border border-[var(--amity-border)] bg-[var(--amity-surface)] px-3 py-1.5 text-left text-xs text-[var(--amity-text-muted)] transition-colors hover:border-[var(--amity-primary)]/40 hover:text-[var(--amity-text)] disabled:opacity-50"
            >
              {s.text}
            </button>
          ))}
        </div>

        {transcriptPreview && (
          <p className="rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg)] px-2 py-1.5 text-xs text-[var(--amity-text-muted)]">
            <span className="font-medium text-[var(--amity-text)]">Transcript: </span>
            {transcriptPreview}
          </p>
        )}

        {speechHint && (
          <p className="text-xs text-[var(--amity-text-muted)]">{speechHint}</p>
        )}

        {speechSupported && onStartSpeech && onStopSpeech && !crisis && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || sending || speechListening}
              onClick={onStartSpeech}
            >
              <Mic className="h-4 w-4" aria-hidden />
              Start voice input
            </Button>
            <Button
              type="button"
              variant={speechListening ? 'primary' : 'secondary'}
              size="sm"
              disabled={disabled || sending || !speechListening}
              onClick={onStopSpeech}
            >
              <MicOff className="h-4 w-4" aria-hidden />
              Stop voice input
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled || sending}
            placeholder={crisis ? 'Crisis mode active…' : 'Type a message…'}
            className="min-h-11 flex-1 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] px-3 text-sm text-[var(--amity-text)] placeholder:text-[var(--amity-text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)] disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={disabled || sending || !input.trim()}
          >
            <Send className="h-4 w-4" aria-hidden />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
