import { NextResponse } from 'next/server';
import type {
  AgentErrorResponse,
  AgentRespondRequest,
  AgentRespondResponse,
} from '@/types/agent';
import { buildGeminiContextPreview } from '@/lib/agent-session-context';
import { classifySafety } from '@/lib/safety-classifier';
import {
  GeminiError,
  generateAmityRecoveryResponse,
  getCrisisSafeResponseText,
} from '@/lib/gemini';

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
    const payload: AgentRespondResponse = {
      response: getCrisisSafeResponseText(),
      safetyLevel: 'crisis',
      recommendedAction: 'open_crisis_flow',
      nextRoute: '/user/crisis',
      provider: { gemini: 'safety', voice: 'disabled' },
      receivedContext,
      crisis: true,
      geminiContextPreview,
    };
    return NextResponse.json(payload);
  }

  let gemini;
  try {
    gemini = await generateAmityRecoveryResponse({
      userMessage,
      sessionId: body.sessionId ?? 'SES-DEMO-001',
      employeeId: body.employeeId ?? 'EMP-001',
      sessionContext,
      selectedRecoveryMode: body.selectedRecoveryMode,
    });
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
        : 'Gemini request failed. Check API key, model name, and server logs.';
    const errorPayload: AgentErrorResponse = {
      error: 'GEMINI_REQUEST_FAILED',
      message,
      provider: { gemini: 'error', voice: 'disabled' },
    };
    return NextResponse.json(errorPayload, { status: 502 });
  }

  if (gemini.safetyLevel === 'crisis') {
    const payload: AgentRespondResponse = {
      response: gemini.response,
      safetyLevel: 'crisis',
      recommendedAction: 'open_crisis_flow',
      nextRoute: '/user/crisis',
      provider: { gemini: 'safety', voice: 'disabled' },
      receivedContext,
      crisis: true,
      geminiContextPreview,
    };
    return NextResponse.json(payload);
  }

  const payload: AgentRespondResponse = {
    response: gemini.response,
    safetyLevel: gemini.safetyLevel,
    recommendedAction: gemini.recommendedAction,
    nextQuestion: gemini.nextQuestion,
    provider: {
      gemini: gemini.provider === 'safety' ? 'safety' : 'real',
      voice: 'disabled',
    },
    receivedContext,
    crisis: false,
    geminiContextPreview,
  };

  return NextResponse.json(payload);
}
