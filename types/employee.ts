import type { EmotionState, StressLevel } from './emotion';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
}

export interface EmotionalDigitalTwin {
  employeeId: string;
  heartRateBpm: number;
  stressScore: number; // 0–100
  stressLevel: StressLevel;
  emotionState: EmotionState;
  lastUpdatedAt: string; // ISO 8601
}

export interface EmployeeSnapshot {
  employee: Employee;
  twin: EmotionalDigitalTwin;
}
