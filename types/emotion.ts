export type EmotionState =
  | 'calm'
  | 'focused'
  | 'anxious'
  | 'frustrated'
  | 'overwhelmed'
  | 'recovering';

export type StressLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0–100
  factors: string[];
  recommendation: 'none' | 'monitor' | 'recovery_call' | 'crisis_check';
  reasoning: string;
}

export interface EmotionalDelta {
  stressBefore: number;
  stressAfter: number;
  emotionBefore: EmotionState;
  emotionAfter: EmotionState;
  heartRateBefore: number;
  heartRateAfter: number;
}
