import { NextResponse } from 'next/server';
import { GeminiError, generateAmityRecoveryResponse } from '@/lib/gemini';
import type { AgentErrorResponse, AgentSessionContextPayload } from '@/types/agent';

const DEMO_SESSION: AgentSessionContextPayload = {
  stressLevel: 82,
  heartRate: 118,
  voiceState: 'shaky',
  transcript: null,
  facialExpression: 'sad',
  facialConfidence: 0.72,
  engagement: 'low',
  facialSignalQuality: 'usable',
  riskLevel: 'high',
  safetyLevel: 'normal',
  triggerType: 'manager_conflict',
  selectedRecoveryMode: 'talk_it_out',
  employeeRole: 'employee',
};

/**
 * POST /api/agent/test — test Gemini adapter without Recovery Room UI.
 * Body: { "message": "I feel overwhelmed after that meeting." }
 */
export async function POST(request: Request) {
  let message = 'I feel overwhelmed after that meeting.';
  try {
    const body = (await request.json()) as { message?: string };
    if (body.message?.trim()) message = body.message.trim();
  } catch {
    /* use default demo message */
  }

  try {
    const result = await generateAmityRecoveryResponse({
      userMessage: message,
      sessionId: 'SES-TEST',
      employeeId: 'EMP-001',
      sessionContext: DEMO_SESSION,
      selectedRecoveryMode: 'talk_it_out',
    });

    return NextResponse.json({
      response: result.response,
      provider: { gemini: result.provider === 'safety' ? 'safety' : 'real', voice: 'disabled' },
      recommendedAction: result.recommendedAction,
      nextQuestion: result.nextQuestion,
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
    const errorPayload: AgentErrorResponse = {
      error: 'GEMINI_REQUEST_FAILED',
      message:
        err instanceof GeminiError
          ? err.message
          : 'Gemini request failed. Check API key, model name, and server logs.',
      provider: { gemini: 'error', voice: 'disabled' },
    };
    return NextResponse.json(errorPayload, { status: 502 });
  }
}
