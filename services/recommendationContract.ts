import { MotivationCheckIn, Recommendation, RecommendationAction } from '../types';

export type RecommendationSource = 'local_rules' | 'ai_model' | 'integration_signal';

export type RecommendationContractInput = {
  source: RecommendationSource;
  userIntent: string;
  motivation: MotivationCheckIn;
  candidate: {
    type: Recommendation['type'];
    title: string;
    summary: string;
    whyItMatters: string;
    whyToday: string;
    tinyAction: string;
    userOverride: string;
    linkedIdentity?: string;
    linkedGoal?: string;
    linkedProject?: string;
    evidence: string[];
    assumptions: string[];
    knowledgeLimits: string[];
    confidence: number;
    actions: RecommendationAction[];
  };
};

export type PlanningContractInput = {
  identity: string;
  desiredPerson?: string;
  obligations?: string;
  values: string[];
  healthContextEnabled: boolean;
  environmentContextEnabled: boolean;
  outputMode: 'local_fallback' | 'ai_json';
};

export const recommendationContractRules = [
  'Every recommendation must explain why it matters and why it appears today.',
  'Every recommendation must include one tiny action.',
  'Every recommendation must include evidence, assumptions, knowledge limits, confidence, and user actions.',
  'Actions must preserve agency: accept, modify, dismiss, or snooze.',
  'Health-sensitive advice must remain general wellness support and name limits.',
  'Low motivation support should shrink, reframe, or add support instead of increasing pressure.'
];

export function buildContractRecommendation(id: string, input: RecommendationContractInput): Recommendation {
  const confidence = clampConfidence(input.candidate.confidence);
  return validateRecommendation({
    id,
    type: input.candidate.type,
    title: input.candidate.title.trim(),
    summary: input.candidate.summary.trim(),
    whyItMatters: input.candidate.whyItMatters.trim(),
    whyToday: input.candidate.whyToday.trim(),
    tinyAction: input.candidate.tinyAction.trim(),
    userOverride: input.candidate.userOverride.trim(),
    linkedIdentity: input.candidate.linkedIdentity,
    linkedGoal: input.candidate.linkedGoal,
    linkedProject: input.candidate.linkedProject,
    evidence: [
      ...input.candidate.evidence.filter(Boolean),
      `Source: ${input.source}.`,
      `Agency support: ${motivationAverage(input.motivation)}%.`
    ],
    confidence,
    assumptions: input.candidate.assumptions.filter(Boolean),
    knowledgeLimits: input.candidate.knowledgeLimits.filter(Boolean),
    actions: normalizeActions(input.candidate.actions)
  });
}

export function validateRecommendation(recommendation: Recommendation): Recommendation {
  const missing = [
    ['title', recommendation.title],
    ['summary', recommendation.summary],
    ['whyItMatters', recommendation.whyItMatters],
    ['whyToday', recommendation.whyToday],
    ['tinyAction', recommendation.tinyAction],
    ['userOverride', recommendation.userOverride]
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Invalid recommendation: missing ${missing.map(([field]) => field).join(', ')}`);
  }
  if (!recommendation.evidence.length) throw new Error('Invalid recommendation: evidence is required');
  if (!recommendation.assumptions.length) throw new Error('Invalid recommendation: assumptions are required');
  if (!recommendation.knowledgeLimits.length) throw new Error('Invalid recommendation: knowledge limits are required');
  if (!hasRequiredActions(recommendation.actions)) throw new Error('Invalid recommendation: accept, dismiss, and snooze actions are required');
  return recommendation;
}

function normalizeActions(actions: RecommendationAction[]): RecommendationAction[] {
  const byId = new Map(actions.map(action => [action.id, action]));
  return [
    byId.get('accept') ?? { id: 'accept', label: 'Use this' },
    byId.get('modify') ?? { id: 'modify', label: 'Adjust' },
    byId.get('dismiss') ?? { id: 'dismiss', label: 'Dismiss' },
    byId.get('snooze') ?? { id: 'snooze', label: 'Snooze' }
  ];
}

function hasRequiredActions(actions: RecommendationAction[]) {
  const ids = new Set(actions.map(action => action.id));
  return ids.has('accept') && ids.has('dismiss') && ids.has('snooze');
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function motivationAverage(checkIn: MotivationCheckIn) {
  return Math.round(((checkIn.autonomy + checkIn.competence + checkIn.relatedness) / 15) * 100);
}
