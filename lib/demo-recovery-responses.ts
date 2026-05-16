import type { SafetyClassification } from '@/types/crisis';
import { classifySafetySync } from './safety-classifier';

export type RecoveryModeId =
  | 'breathe_first'
  | 'talk_it_out'
  | 'prepare_next_step'
  | 'reset_before_call'
  | 'human_support';

export const RECOVERY_MODES: { id: RecoveryModeId; label: string }[] = [
  { id: 'breathe_first', label: 'Breathe first' },
  { id: 'talk_it_out', label: 'Talk it out' },
  { id: 'prepare_next_step', label: 'Prepare next step' },
  { id: 'reset_before_call', label: 'Reset before next call' },
  { id: 'human_support', label: 'Connect human support' },
];

export const SAMPLE_USER_MESSAGES = [
  { id: 'overwhelmed', text: 'I feel overwhelmed after that meeting.' },
  { id: 'manager', text: 'My manager blamed me in front of everyone.' },
  { id: 'next_call', text: 'I need a minute before my next call.' },
  { id: 'handle_today', text: 'I feel like I cannot handle today.' },
  { id: 'crisis', text: 'I am not safe right now.' },
] as const;

export type ElevenLabsVoiceMode =
  | 'grounding_slow'
  | 'warm_gentle'
  | 'calm_supportive'
  | 'firm_steady'
  | 'crisis_serious';

export function mapVoiceModeLabel(mode: ElevenLabsVoiceMode | string): string {
  const labels: Record<string, string> = {
    grounding_slow: 'Grounding · slow',
    warm_gentle: 'Warm · gentle',
    calm_supportive: 'Calm · supportive',
    calm_support: 'Calm · supportive',
    firm_steady: 'Firm · steady',
    crisis_serious: 'Crisis · serious',
    disabled: 'Off',
  };
  return labels[mode] ?? mode;
}

export function pickVoiceMode(
  crisis: boolean,
  stressLevel: number
): ElevenLabsVoiceMode {
  if (crisis) return 'crisis_serious';
  if (stressLevel >= 75) return 'grounding_slow';
  if (stressLevel >= 50) return 'warm_gentle';
  return 'calm_supportive';
}

export interface DemoResponseResult {
  text: string;
  crisis: boolean;
  safety: SafetyClassification;
  voiceMode: ElevenLabsVoiceMode;
}

export function getDemoResponseForMessage(
  userText: string,
  mode: RecoveryModeId = 'talk_it_out'
): DemoResponseResult {
  const safety = classifySafetySync(userText);
  const crisis = safety.mode === 'crisis';
  const lower = userText.toLowerCase();

  if (crisis) {
    return {
      crisis: true,
      safety,
      voiceMode: 'crisis_serious',
      text: "I'm really sorry you're feeling unsafe. I do not want you to handle this alone. Normal coaching is paused, and Amity is preparing human support options now.",
    };
  }

  if (lower.includes('manager') || lower.includes('blamed')) {
    return {
      crisis: false,
      safety,
      voiceMode: 'grounding_slow',
      text: 'Being blamed in front of others can feel intense. You do not need to solve the whole situation right now. Let’s steady your breathing first, then prepare one calm next step.',
    };
  }

  if (lower.includes('next call') || lower.includes('minute before')) {
    return {
      crisis: false,
      safety,
      voiceMode: 'firm_steady',
      text: 'Let’s reset your body before the next interaction. Would you like a 60-second breathing reset or a short response plan?',
    };
  }

  if (lower.includes('overwhelmed') || lower.includes('cannot handle')) {
    return {
      crisis: false,
      safety,
      voiceMode: 'warm_gentle',
      text: 'That sounded heavy. Let’s slow the moment down first. Take one breath with me, then we’ll separate what happened from what you can do next.',
    };
  }

  if (mode === 'breathe_first') {
    return {
      crisis: false,
      safety,
      voiceMode: 'grounding_slow',
      text: 'Let’s breathe together. In for four counts, hold gently, out for six. I’ll stay with you through two cycles.',
    };
  }

  return {
    crisis: false,
    safety,
    voiceMode: 'calm_supportive',
    text: 'Thank you for sharing that. This space is private and calm. What feels most pressing in this moment?',
  };
}
