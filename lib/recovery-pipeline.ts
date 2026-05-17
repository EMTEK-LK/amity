import type { AmityRecoveryResponseInput } from './recovery-llm-prompt';
import { generateAmityRecoveryResponse } from './gemini';
import { generateAmityVoice, type AmityVoiceMode } from './elevenlabs';
import { getBeyondPresenceConfig } from './beyond-presence';
import { pickVoiceMode } from './demo-recovery-responses';
import { shouldSkipServerTts } from './recovery-performance';
import type { AmityRecoveryResponseResult } from './llm-types';
import type { AgentAudioStatus } from '@/types/agent';

export interface RecoveryPipelineVoice {
  audioUrl: string | null;
  status: AgentAudioStatus;
  voiceMode: string;
  placeholder: boolean;
}

export interface RecoveryPipelineAvatar {
  displayMode: 'stage' | 'iframe' | 'livekit';
  embedUrl: string | null;
  sessionUrl: string | null;
  agentId: string | null;
  agentName: string | null;
  placeholder: boolean;
}

export interface RecoveryPipelineResult {
  llm: AmityRecoveryResponseResult;
  voice: RecoveryPipelineVoice;
  avatar: RecoveryPipelineAvatar;
}

function delegatedVoiceResult(voiceMode: string): RecoveryPipelineVoice {
  return {
    audioUrl: null,
    status: 'disabled',
    voiceMode,
    placeholder: true,
  };
}

export async function runRecoveryPipeline(
  input: AmityRecoveryResponseInput,
  opts?: { crisis?: boolean; stressLevel?: number }
): Promise<RecoveryPipelineResult> {
  const skipServerTts = shouldSkipServerTts();

  const [llm, avatar] = await Promise.all([
    generateAmityRecoveryResponse(input),
    getBeyondPresenceConfig(),
  ]);

  const crisis = opts?.crisis ?? llm.safetyLevel === 'crisis';
  const stress = opts?.stressLevel ?? input.sessionContext.stressLevel ?? 50;
  const voiceMode: AmityVoiceMode = crisis
    ? 'crisis_serious'
    : pickVoiceMode(false, stress);

  const speakText = [llm.response, llm.nextQuestion].filter(Boolean).join(' ').trim();

  let voice: RecoveryPipelineVoice;
  if (skipServerTts) {
    voice = delegatedVoiceResult(voiceMode);
  } else {
    const voiceResult = await generateAmityVoice({ text: speakText, voiceMode });
    voice = {
      audioUrl: voiceResult.audioUrl,
      status: voiceResult.audioStatus,
      voiceMode,
      placeholder: voiceResult.placeholder,
    };
  }

  return {
    llm,
    voice,
    avatar: {
      displayMode: avatar.displayMode,
      embedUrl: avatar.embedUrl,
      sessionUrl: avatar.sessionUrl,
      agentId: avatar.agentId,
      agentName: avatar.agentName,
      placeholder: avatar.placeholder,
    },
  };
}
