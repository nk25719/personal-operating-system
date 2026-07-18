import { Recommendation } from '../types';

const relationshipCuePatterns = [
  'relationship',
  'relatedness',
  'connection',
  'social',
  'check-in',
  'check in',
  'name who this action serves',
  'add support'
];

export function isRelationshipCue(recommendation: Partial<Recommendation> | null | undefined) {
  if (!recommendation) return false;
  if (recommendation.type === 'relationship_checkin') return true;
  const searchable = [
    recommendation.id,
    recommendation.type,
    recommendation.title,
    recommendation.summary,
    recommendation.whyToday,
    recommendation.whyItMatters,
    recommendation.tinyAction,
    recommendation.userOverride,
    recommendation.linkedGoal,
    recommendation.linkedProject,
    ...(recommendation.evidence ?? []),
    ...(recommendation.assumptions ?? []),
    ...(recommendation.knowledgeLimits ?? []),
    ...(recommendation.actions ?? []).map(action => `${action.id} ${action.label}`)
  ].filter(Boolean).join(' ').toLowerCase();

  return relationshipCuePatterns.some(pattern => searchable.includes(pattern));
}
