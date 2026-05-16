export interface GeminiAgentRequest {
  context: string;
  triggerCategory?: string;
  employeeFirstName?: string;
}

export interface GeminiAgentResponse {
  supportText: string;
  sessionSummary?: string;
}

/**
 * Gemini: emotional support copy and session summaries.
 * Implementation planned in Phase 4.
 */
export async function generateSupportResponse(
  _request: GeminiAgentRequest
): Promise<GeminiAgentResponse> {
  throw new Error('gemini not implemented — Phase 4');
}
