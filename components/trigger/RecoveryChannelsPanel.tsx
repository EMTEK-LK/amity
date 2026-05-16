'use client';

import { MessageCircle, Smartphone, Video, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const channels = [
  {
    id: 'in_app',
    label: 'Amity in-app recovery',
    icon: Smartphone,
    active: true,
    note: 'Available now',
  },
  {
    id: 'bp',
    label: 'Beyond Presence video session',
    icon: Video,
    active: true,
    note: 'Primary channel',
  },
  {
    id: 'teams',
    label: 'Microsoft Teams message',
    icon: MessageCircle,
    active: false,
    note: 'Future integration',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp alert',
    icon: MessageCircle,
    active: false,
    note: 'Future integration',
  },
  {
    id: 'voice',
    label: 'Voice wake trigger',
    icon: Volume2,
    active: false,
    note: 'Future integration',
  },
] as const;

export function RecoveryChannelsPanel() {
  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recovery channels</CardTitle>
        <p className="text-sm text-[var(--amity-text-muted)]">
          How Amity can reach the employee
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  ch.active
                    ? 'bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]'
                    : 'bg-[var(--amity-bg-subtle)] text-[var(--amity-text-muted)]'
                }`}
              >
                <ch.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="truncate text-sm font-medium text-[var(--amity-text)]">
                {ch.label}
              </span>
            </div>
            <Badge variant={ch.active ? 'primary' : 'neutral'}>{ch.note}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
