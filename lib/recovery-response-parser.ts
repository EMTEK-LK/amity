import { getDemoResponseForMessage } from './demo-recovery-responses';
import { parseRecoveryJson } from './recovery-llm-prompt';
import type { AmityRecoveryResponseResult } from './llm-types';

const REASONING_MARKERS = [
  /\bwe need to\b/i,
  /\bthe user says\b/i,
  /\baccording to instruction\b/i,
  /\bsession context\b/i,
  /\brecommendedAction\b/i,
  /\bnextQuestion can be\b/i,
  /\blet's pick\b/i,
  /\bmust include response\b/i,
  /\bjson only\b/i,
  /\bno markdown\b/i,
  /\brespond with json\b/i,
  /\boutput json\b/i,
  /\bpossibly from facial\b/i,
  /\bso we (can|proceed|need)\b/i,
];

/** Chain-of-thought leaks from free/reasoning models — never show in chat. */
export function isReasoningLeak(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length > 520) return true;
  let hits = 0;
  for (const re of REASONING_MARKERS) {
    if (re.test(t)) hits += 1;
  }
  return hits >= 2;
}

function extractJsonObjects(text: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        results.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return results;
}

export function normalizeRecoveryResponse(
  raw: string,
  fallback?: { userMessage: string; selectedRecoveryMode?: string | null }
): AmityRecoveryResponseResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidates = [
    trimmed,
    ...extractJsonObjects(trimmed),
  ];

  for (const candidate of candidates) {
    const parsed = parseRecoveryJson(candidate);
    if (parsed?.response && !isReasoningLeak(parsed.response)) {
      return {
        response: parsed.response.trim(),
        safetyLevel: 'normal',
        recommendedAction: parsed.recommendedAction ?? 'guided_reset',
        nextQuestion:
          typeof parsed.nextQuestion === 'string' ? parsed.nextQuestion.trim() : null,
        provider: 'real',
      };
    }
  }

  if (fallback && !isReasoningLeak(trimmed) && trimmed.length < 400 && !trimmed.includes('{')) {
    return {
      response: trimmed,
      safetyLevel: 'normal',
      recommendedAction: 'guided_reset',
      nextQuestion: null,
      provider: 'real',
    };
  }

  return null;
}

export function buildFallbackRecoveryResponse(
  userMessage: string,
  selectedRecoveryMode?: string | null
): AmityRecoveryResponseResult {
  const mode = (selectedRecoveryMode ?? 'talk_it_out') as
    | 'breathe_first'
    | 'talk_it_out'
    | 'prepare_next_step'
    | 'reset_before_call'
    | 'human_support';
  const demo = getDemoResponseForMessage(userMessage, mode);
  return {
    response: demo.text,
    safetyLevel: demo.crisis ? 'crisis' : 'normal',
    recommendedAction: demo.crisis ? 'open_crisis_flow' : 'continue_recovery',
    nextQuestion: null,
    provider: 'real',
  };
}
