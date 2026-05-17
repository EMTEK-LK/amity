'use client';

import { cn } from '@/lib/utils';
import { RECOVERY_MODES, type RecoveryModeId } from '@/lib/demo-recovery-responses';

interface QuickModeButtonsProps {
  selected: RecoveryModeId;
  onSelect: (mode: RecoveryModeId) => void;
  disabled: boolean;
}

export function QuickModeButtons({ selected, onSelect, disabled }: QuickModeButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {RECOVERY_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(m.id)}
          className={cn(
            'min-h-10 rounded-full border px-3 py-2 text-xs font-medium transition-colors',
            selected === m.id
              ? 'border-[var(--amity-primary)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]'
              : 'border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-text-muted)] hover:text-[var(--amity-text)]',
            disabled && 'opacity-50'
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
