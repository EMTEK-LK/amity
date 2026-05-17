import { NextResponse } from 'next/server';
import type {
  AgentErrorResponse,
  AgentRespondRequest,
  AgentRespondResponse,
} from '@/types/agent';
import { buildGeminiContextPreview } from '@/lib/agent-session-context';
import { classifySafety } from '@/lib/safety-classifier';
import { GeminiError, getCrisisSafeResponseText } from '@/lib/gemini';
import { runRecoveryPipeline } from '@/lib/recovery-pipeline';
import { generateAmityVoice } from '@/lib/elevenlabs';
import { getBeyondPresenceConfig } from '@/lib/beyond-presence';
import { shouldSkipServerTts } from '@/lib/recovery-performance';

export async function POST(request: Request) {
  let body: AgentRespondRequest;
  try {
    body = (await request.json()) as AgentRespondRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userMessage = body.userMessage?.trim();
  if (!userMessage) {
    return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
  }

  const defaults = {
    stressLevel: 50,
    heartRate: 72,
    voiceState: 'calm',
    riskLevel: 'low' as const,
    safetyLevel: 'normal' as const,
  };
  const sessionContext = {
    ...defaults,
    ...(body.sessionContext ?? {}),
    selectedRecoveryMode:
      body.selectedRecoveryMode ?? body.sessionContext?.selectedRecoveryMode ?? null,
  };

  const geminiContextPreview = buildGeminiContextPreview(userMessage, sessionContext, {
    source: body.source ?? 'typed_input',
  });

  const receivedContext = {
    facialExpression: sessionContext.facialExpression ?? null,
    facialConfidence: sessionContext.facialConfidence ?? null,
    engagement: sessionContext.engagement ?? null,
    voiceState: sessionContext.voiceState,
    riskLevel: sessionContext.riskLevel,
    stressLevel: sessionContext.stressLevel,
  };

  const safety = await classifySafety(userMessage);
  if (safety.mode === 'crisis') {
    const crisisText = getCrisisSafeResponseText();
    const skipServerTts = shouldSkipServerTts();
    const [voice, avatar] = await Promise.all([
      skipServerTts
        ? Promise.resolve({
            audioUrl: null,
            audioStatus: 'disabled' as const,
            placeholder: true,
          })
        : generateAmityVoice({
            text: crisisText,
            voiceMode: 'crisis_serious',
          }),
      getBeyondPresenceConfig(),
    ]);
    const payload: AgentRespondResponse = {
      response: crisisText,
      safetyLevel: 'crisis',
      recommendedAction: 'open_crisis_flow',
      nextRoute: '/user/crisis',
      provider: { gemini: 'safety', voice: voice.audioStatus },
      receivedContext,
      crisis: true,
      geminiContextPreview,
      voice: {
        audioUrl: voice.audioUrl,
        status: voice.audioStatus,
        voiceMode: 'crisis_serious',
        placeholder: voice.placeholder,
      },
      avatar: {
        displayMode: avatar.displayMode,
        embedUrl: avatar.embedUrl,
        sessionUrl: avatar.sessionUrl,
        agentId: avatar.agentId,
        agentName: avatar.agentName,
        placeholder: avatar.placeholder,
      },
    };
    return NextResponse.json(payload);
  }

  try {
    const pipeline = await runRecoveryPipeline(
      {
        userMessage,
        sessionId: body.sessionId ?? 'SES-DEMO-001',
        employeeId: body.employeeId ?? 'EMP-001',
        sessionContext,
        selectedRecoveryMode: body.selectedRecoveryMode,
      },
      { stressLevel: sessionContext.stressLevel }
    );

    const { llm, voice, avatar } = pipeline;

    if (llm.safetyLevel === 'crisis') {
      const payload: AgentRespondResponse = {
        response: llm.response,
        safetyLevel: 'crisis',
        recommendedAction: 'open_crisis_flow',
        nextRoute: '/user/crisis',
        provider: { gemini: 'safety', voice: voice.status },
        receivedContext,
        crisis: true,
        geminiContextPreview,
        voice: {
          audioUrl: voice.audioUrl,
          status: voice.status,
          voiceMode: voice.voiceMode,
          placeholder: voice.placeholder,
        },
        avatar,
      };
      return NextResponse.json(payload);
    }

    const payload: AgentRespondResponse = {
      response: llm.response,
      safetyLevel: llm.safetyLevel,
      recommendedAction: llm.recommendedAction,
      nextQuestion: llm.nextQuestion,
      provider: {
        gemini: llm.provider === 'safety' ? 'safety' : 'real',
        voice: voice.status,
      },
      receivedContext,
      crisis: false,
      geminiContextPreview,
      voice: {
        audioUrl: voice.audioUrl,
        status: voice.status,
        voiceMode: voice.voiceMode,
        placeholder: voice.placeholder,
      },
      avatar,
    };

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof GeminiError && err.code === 'GEMINI_API_KEY_MISSING') {
      const errorPayload: AgentErrorResponse = {
        error: 'GEMINI_API_KEY_MISSING',
        message: err.message,
        provider: { gemini: 'not_configured', voice: 'disabled' },
      };
      return NextResponse.json(errorPayload, { status: 400 });
    }
    const message =
      err instanceof GeminiError
        ? err.message
        : 'Recovery agent request failed. Check API keys and server logs.';
    if (process.env.NODE_ENV === 'development') {
      console.error('[AmityRecovery] /api/agent/respond failed:', message);
    }
    const errorPayload: AgentErrorResponse = {
      error: 'GEMINI_REQUEST_FAILED',
      message,
      provider: { gemini: 'error', voice: 'error' },
    };
    return NextResponse.json(errorPayload, { status: 502 });
  }
}
