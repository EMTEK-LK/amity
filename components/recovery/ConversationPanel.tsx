'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { SAMPLE_USER_MESSAGES } from '@/lib/demo-recovery-responses';
import type { ConversationMessage } from '@/types/recovery-room';

interface ConversationPanelProps {
  messages: ConversationMessage[];
  crisis: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
}

export function ConversationPanel({
  messages,
  crisis,
  disabled,
  onSend,
}: ConversationPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput('');
  };

  return (
    <Card variant="default" className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Conversation</CardTitle>
        <p className="text-xs text-[var(--amity-text-muted)]">
          {crisis ? 'Normal coaching paused' : 'Private session · demo responses'}
        </p>
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
              disabled={disabled}
              onClick={() => onSend(s.text)}
              className="min-h-10 rounded-full border border-[var(--amity-border)] bg-[var(--amity-surface)] px-3 py-1.5 text-left text-xs text-[var(--amity-text-muted)] transition-colors hover:border-[var(--amity-primary)]/40 hover:text-[var(--amity-text)] disabled:opacity-50"
            >
              {s.text}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder={crisis ? 'Crisis mode active…' : 'Type a message…'}
            className="min-h-11 flex-1 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] px-3 text-sm text-[var(--amity-text)] placeholder:text-[var(--amity-text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)] disabled:opacity-50"
          />
          <Button type="submit" variant="primary" size="md" disabled={disabled || !input.trim()}>
            <Send className="h-4 w-4" aria-hidden />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
