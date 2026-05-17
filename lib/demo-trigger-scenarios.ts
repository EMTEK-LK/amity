import type { EngagementLevel } from '@/types/session-context';
import type { FacialExpression } from '@/types/facial-awareness';
import type { VoiceState } from '@/types/voice';
import type {
  EmotionalTwinState,
  TriggerPayload,
  TriggerScenario,
  TriggerSignalType,
  TriggerTimelineItem,
} from '@/types/trigger';
import { DEMO_EMPLOYEE as DEMO_EMPLOYEE_IDENTITY } from './demo-identities';

type ScenarioCore = Omit<
  TriggerScenario,
  'label' | 'sourceType' | 'voiceState' | 'facialSignal' | 'engagement' | 'payload'
>;

const SCENARIO_SIGNALS: Record<
  string,
  {
    voiceState: VoiceState;
    facialSignal: FacialExpression;
    engagement: EngagementLevel;
    sourceType: TriggerSignalType;
  }
> = {
  manager_conflict: {
    voiceState: 'shaky',
    facialSignal: 'sad',
    engagement: 'low',
    sourceType: 'workplace',
  },
  customer_escalation: {
    voiceState: 'fast',
    facialSignal: 'stressed',
    engagement: 'low',
    sourceType: 'workplace',
  },
  workload_spike: {
    voiceState: 'fast',
    facialSignal: 'stressed',
    engagement: 'medium',
    sourceType: 'workplace',
  },
  panic_before_presentation: {
    voiceState: 'shaky',
    facialSignal: 'stressed',
    engagement: 'low',
    sourceType: 'wearable',
  },
  late_night_burnout: {
    voiceState: 'low_energy',
    facialSignal: 'tired',
    engagement: 'low',
    sourceType: 'wearable',
  },
  sales_rejection: {
    voiceState: 'low_energy',
    facialSignal: 'sad',
    engagement: 'medium',
    sourceType: 'workplace',
  },
  manual_help_request: {
    voiceState: 'distressed',
    facialSignal: 'uncertain',
    engagement: 'low',
    sourceType: 'manual',
  },
  wake_word: {
    voiceState: 'shaky',
    facialSignal: 'stressed',
    engagement: 'low',
    sourceType: 'manual',
  },
  future_video_signal: {
    voiceState: 'distressed',
    facialSignal: 'sad',
    engagement: 'low',
    sourceType: 'video',
  },
  critical_self_harm_risk: {
    voiceState: 'distressed',
    facialSignal: 'sad',
    engagement: 'low',
    sourceType: 'crisis',
  },
};

function buildScenarioPayload(
  s: ScenarioCore
): Omit<TriggerPayload, 'simulatedAt'> {
  return {
    employeeId: DEMO_EMPLOYEE.id,
    source: s.source,
    triggerType: s.triggerType,
    emotionSignal: s.emotionSignal,
    stressScore: s.stressScore,
    heartRate: s.heartRate,
    riskLevel: s.riskLevel,
    recommendedAction: s.recommendedAction,
    triggerId: s.id,
    category: s.category,
  };
}

function completeScenario(s: ScenarioCore): TriggerScenario {
  const sig = SCENARIO_SIGNALS[s.id] ?? {
    voiceState: 'unknown' as VoiceState,
    facialSignal: 'neutral' as FacialExpression,
    engagement: 'medium' as EngagementLevel,
    sourceType: 'workplace' as TriggerSignalType,
  };
  return {
    ...s,
    label: s.name,
    ...sig,
    payload: buildScenarioPayload(s),
  };
}

export const DEMO_EMPLOYEE = {
  id: DEMO_EMPLOYEE_IDENTITY.id,
  name: DEMO_EMPLOYEE_IDENTITY.name,
  role: DEMO_EMPLOYEE_IDENTITY.role,
  department: DEMO_EMPLOYEE_IDENTITY.department,
  preferredMode: 'Calm reset',
  connectedSignals: ['Watch', 'Work apps', 'Manual request'] as const,
};

export const defaultStableState: EmotionalTwinState = {
  stressScore: 22,
  heartRate: 68,
  emotion: 'Calm',
  riskScore: 12,
  riskLevel: 'low',
  statusType: 'stable',
  recoveryMode: 'Standby',
};

function timeline(...items: Omit<TriggerTimelineItem, 'id'>[]): TriggerTimelineItem[] {
  return items.map((item, i) => ({ ...item, id: `t-${i}` }));
}

const RAW_SCENARIOS: ScenarioCore[] = [
  {
    id: 'manager_conflict',
    name: 'Manager Conflict',
    category: 'manager_conflict',
    source: 'microsoft_teams',
    sourceLabel: 'Microsoft Teams',
    context: 'Blamed during a team review',
    emotion: 'Sadness + overwhelm',
    stressScore: 84,
    heartRate: 118,
    riskScore: 94,
    riskLevel: 'high',
    signalTypes: ['workplace', 'wearable'],
    triggerType: 'manager_conflict',
    emotionSignal: 'sad_overwhelmed',
    recommendedAction: 'start_recovery_session',
    statusType: 'recovery_needed',
    recoveryMode: 'Calm reset',
    isCrisis: false,
    riskReason: 'Manager conflict + elevated heart rate + sadness/overwhelm signal',
    riskAction: 'Start private recovery session',
    iconKey: 'users',
    timeline: timeline(
      { label: 'Teams meeting ended', detail: 'Signal received' },
      { label: 'Stress signal increased', detail: '+62 from baseline' },
      { label: 'Heart rate crossed baseline', detail: '118 bpm' },
      { label: 'Risk decision: high pressure', detail: 'Score 94' },
      { label: 'Recovery session recommended', detail: 'Private reset' }
    ),
  },
  {
    id: 'customer_escalation',
    name: 'Customer Escalation',
    category: 'customer_escalation',
    source: 'call_center',
    sourceLabel: 'Call center',
    context: 'Aggressive support call',
    emotion: 'Frustration + anxiety',
    stressScore: 88,
    heartRate: 122,
    riskScore: 92,
    riskLevel: 'high',
    signalTypes: ['workplace', 'wearable'],
    triggerType: 'customer_escalation',
    emotionSignal: 'frustrated_anxious',
    recommendedAction: 'start_recovery_session',
    statusType: 'recovery_needed',
    recoveryMode: 'Calm reset',
    isCrisis: false,
    riskReason: 'Call-center escalation + frustration spike + elevated vitals',
    riskAction: 'Start private recovery session',
    iconKey: 'phone',
    timeline: timeline(
      { label: 'Call ended abruptly', detail: 'Signal received' },
      { label: 'Frustration signal detected', detail: 'Workplace channel' },
      { label: 'Heart rate elevated', detail: '122 bpm' },
      { label: 'Risk recalculated', detail: 'High pressure' },
      { label: 'Private recovery recommended', detail: 'In-app session' }
    ),
  },
  {
    id: 'workload_spike',
    name: 'Workload Spike',
    category: 'workload_spike',
    source: 'calendar',
    sourceLabel: 'Calendar + tasks',
    context: 'Deadlines and back-to-back meetings',
    emotion: 'Overwhelm',
    stressScore: 76,
    heartRate: 105,
    riskScore: 68,
    riskLevel: 'support_recommended',
    signalTypes: ['workplace', 'wearable'],
    triggerType: 'workload_spike',
    emotionSignal: 'overwhelmed',
    recommendedAction: 'start_recovery_session',
    statusType: 'support_recommended',
    recoveryMode: 'Focus reset',
    isCrisis: false,
    riskReason: 'Calendar density + task overload + sustained stress',
    riskAction: 'Offer private recovery session',
    iconKey: 'calendar',
    timeline: timeline(
      { label: 'Calendar conflict detected', detail: '3 overlapping blocks' },
      { label: 'Task queue spike', detail: 'Workload signal' },
      { label: 'Stress trend rising', detail: '76 score' },
      { label: 'Support recommended', detail: 'Prevent escalation' }
    ),
  },
  {
    id: 'panic_before_presentation',
    name: 'Panic Before Presentation',
    category: 'panic_before_presentation',
    source: 'calendar',
    sourceLabel: 'Calendar + wearable',
    context: 'Presentation starts in 10 minutes',
    emotion: 'Anxiety',
    stressScore: 82,
    heartRate: 116,
    riskScore: 86,
    riskLevel: 'high',
    signalTypes: ['wearable', 'workplace'],
    triggerType: 'panic_before_presentation',
    emotionSignal: 'anxious',
    recommendedAction: 'start_recovery_session',
    statusType: 'recovery_needed',
    recoveryMode: 'Pre-event calm',
    isCrisis: false,
    riskReason: 'Imminent presentation + anxiety spike + elevated heart rate',
    riskAction: 'Start private recovery session',
    iconKey: 'presentation',
    timeline: timeline(
      { label: 'Upcoming event flagged', detail: 'T-minus 10 min' },
      { label: 'Wearable anxiety signal', detail: 'HRV drop' },
      { label: 'Heart rate rising', detail: '116 bpm' },
      { label: 'Risk decision: high', detail: 'Pre-event pressure' },
      { label: 'Quick reset recommended', detail: '5 min session' }
    ),
  },
  {
    id: 'late_night_burnout',
    name: 'Late Night Burnout',
    category: 'late_night_burnout',
    source: 'work_pattern',
    sourceLabel: 'Work pattern',
    context: 'Long work session after hours',
    emotion: 'Exhaustion',
    stressScore: 79,
    heartRate: 98,
    riskScore: 64,
    riskLevel: 'support_recommended',
    signalTypes: ['wearable', 'workplace'],
    triggerType: 'late_night_burnout',
    emotionSignal: 'exhausted',
    recommendedAction: 'start_recovery_session',
    statusType: 'support_recommended',
    recoveryMode: 'Wind-down reset',
    isCrisis: false,
    riskReason: 'Extended after-hours activity + fatigue pattern',
    riskAction: 'Offer recovery before burnout escalates',
    iconKey: 'moon',
    timeline: timeline(
      { label: 'After-hours activity detected', detail: 'Work pattern' },
      { label: 'Fatigue signal from wearable', detail: 'Low recovery score' },
      { label: 'Stress sustained', detail: '79 score' },
      { label: 'Support recommended', detail: 'Prevent next-day crash' }
    ),
  },
  {
    id: 'sales_rejection',
    name: 'Sales Rejection',
    category: 'sales_rejection',
    source: 'crm',
    sourceLabel: 'CRM',
    context: 'Lost a major deal',
    emotion: 'Disappointment',
    stressScore: 68,
    heartRate: 96,
    riskScore: 58,
    riskLevel: 'support_recommended',
    signalTypes: ['workplace'],
    triggerType: 'sales_rejection',
    emotionSignal: 'disappointed',
    recommendedAction: 'start_recovery_session',
    statusType: 'support_recommended',
    recoveryMode: 'Reframe reset',
    isCrisis: false,
    riskReason: 'Deal loss signal + disappointment + mild vitals elevation',
    riskAction: 'Offer private recovery session',
    iconKey: 'trending_down',
    timeline: timeline(
      { label: 'CRM outcome logged', detail: 'Deal lost' },
      { label: 'Emotional dip detected', detail: 'Disappointment' },
      { label: 'Risk recalculated', detail: 'Support tier' },
      { label: 'Recovery optional', detail: 'Employee choice' }
    ),
  },
  {
    id: 'manual_help_request',
    name: 'Manual Help Request',
    category: 'manual_help_request',
    source: 'manual',
    sourceLabel: 'Amity app',
    context: 'Employee taps “I need a reset”',
    emotion: 'Distressed',
    stressScore: 72,
    heartRate: 101,
    riskScore: 62,
    riskLevel: 'support_recommended',
    signalTypes: ['manual'],
    triggerType: 'manual_help_request',
    emotionSignal: 'distressed',
    recommendedAction: 'start_recovery_session',
    statusType: 'support_recommended',
    recoveryMode: 'Calm reset',
    isCrisis: false,
    riskReason: 'Explicit employee request for support',
    riskAction: 'Start private recovery session',
    iconKey: 'hand',
    timeline: timeline(
      { label: 'Manual trigger received', detail: 'In-app request' },
      { label: 'Signal received', detail: 'Immediate' },
      { label: 'Risk assessed', detail: 'Support recommended' },
      { label: 'Session queued', detail: 'Private channel' }
    ),
  },
  {
    id: 'wake_word',
    name: 'Wake Word',
    category: 'wake_word',
    source: 'wake_word',
    sourceLabel: 'Voice trigger',
    context: '“Amity, I need help”',
    emotion: 'Overwhelmed',
    stressScore: 80,
    heartRate: 112,
    riskScore: 78,
    riskLevel: 'high',
    signalTypes: ['manual', 'wearable'],
    triggerType: 'wake_word',
    emotionSignal: 'overwhelmed',
    recommendedAction: 'start_recovery_session',
    statusType: 'recovery_needed',
    recoveryMode: 'Voice-led reset',
    isCrisis: false,
    riskReason: 'Voice distress cue + overwhelmed state + elevated vitals',
    riskAction: 'Start private recovery session',
    iconKey: 'mic',
    timeline: timeline(
      { label: 'Wake word detected', detail: 'Demo signal only' },
      { label: 'Voice intent parsed', detail: 'Help request' },
      { label: 'Wearable confirms stress', detail: '80 score' },
      { label: 'Recovery session recommended', detail: 'In-app + video' }
    ),
  },
  {
    id: 'future_video_signal',
    name: 'Video session safety signal',
    category: 'future_video_signal',
    source: 'bp_video_analysis',
    sourceLabel: 'BP video/audio analysis',
    context: 'Crisis language detected during recovery call',
    emotion: 'Severe distress',
    stressScore: 96,
    heartRate: 128,
    riskScore: 100,
    riskLevel: 'crisis',
    signalTypes: ['video', 'crisis'],
    triggerType: 'future_video_signal',
    emotionSignal: 'severe_distress',
    recommendedAction: 'crisis_safety_flow',
    statusType: 'crisis',
    recoveryMode: 'Crisis Safety Mode',
    isCrisis: true,
    riskReason: 'In-session severe distress language + vitals critical',
    riskAction: 'Crisis Safety Flow — human escalation required',
    crisisNotice:
      'Normal recovery coaching is paused. Amity prepares live handoff and emergency support options.',
    iconKey: 'video',
    timeline: timeline(
      { label: 'BP recovery session active', detail: 'Demo signal only' },
      { label: 'Transcript signal flagged', detail: 'Severe distress' },
      { label: 'Crisis Safety Mode activated', detail: 'Coaching paused' },
      { label: 'Live handoff recommended', detail: 'Human support' }
    ),
  },
  {
    id: 'critical_self_harm_risk',
    name: 'Critical Self-Harm Risk',
    category: 'critical_self_harm_risk',
    source: 'safety_classifier',
    sourceLabel: 'Safety classifier',
    context: 'User says they are not safe',
    emotion: 'Crisis',
    stressScore: 100,
    heartRate: 132,
    riskScore: 100,
    riskLevel: 'crisis',
    signalTypes: ['crisis'],
    triggerType: 'critical_self_harm_risk',
    emotionSignal: 'crisis',
    recommendedAction: 'crisis_safety_flow',
    statusType: 'crisis',
    recoveryMode: 'Crisis Safety Mode',
    isCrisis: true,
    riskReason: 'Safety classifier: immediate danger language detected',
    riskAction: 'Crisis Safety Flow — never AI-only',
    crisisNotice:
      'Normal recovery coaching is paused. Amity prepares live handoff and emergency support options.',
    iconKey: 'shield_alert',
    timeline: timeline(
      { label: 'Safety classifier triggered', detail: 'Not safe language' },
      { label: 'Normal coaching stopped', detail: 'Policy enforced' },
      { label: 'Crisis mode engaged', detail: 'Score 100' },
      { label: 'Emergency options prepared', detail: 'Human escalation' }
    ),
  },
];

export const TRIGGER_SCENARIOS: TriggerScenario[] = RAW_SCENARIOS.map(completeScenario);

export function getTriggerScenarioById(id: string): TriggerScenario | undefined {
  return TRIGGER_SCENARIOS.find((s) => s.id === id);
}

export function scenarioToTwinState(scenario: TriggerScenario): EmotionalTwinState {
  return {
    stressScore: scenario.stressScore,
    heartRate: scenario.heartRate,
    emotion: scenario.emotion,
    riskScore: scenario.riskScore,
    riskLevel: scenario.riskLevel,
    statusType: scenario.statusType,
    recoveryMode: scenario.recoveryMode,
  };
}

export function buildTriggerPayload(
  scenario: TriggerScenario,
  simulatedAt: string = new Date().toISOString()
): TriggerPayload {
  return { ...scenario.payload, simulatedAt };
}

export {
  updateContextFromTrigger,
  createInitialSessionContext,
  buildSessionContextFromScenario,
} from './session-context';

export function buildSignalTimeline(scenario: TriggerScenario): TriggerTimelineItem[] {
  return scenario.timeline;
}

export const SIGNAL_TYPE_LABELS: Record<
  import('@/types/trigger').TriggerSignalType,
  string
> = {
  wearable: 'Wearable',
  workplace: 'Workplace',
  manual: 'Manual',
  video: 'Video',
  crisis: 'Crisis',
};

export function riskLevelLabel(level: import('@/types/trigger').TriggerRiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low';
    case 'support_recommended':
      return 'Support recommended';
    case 'high':
      return 'High';
    case 'crisis':
      return 'Crisis';
  }
}
