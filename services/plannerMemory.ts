import { PlannerMemoryResponse, Recommendation } from '../types';
import { appendMutationEvent, appendPlannerMemory } from '../utils/storage';

export async function recordRecommendationResponse(input: {
  recommendation: Recommendation;
  userIntention: string;
  response: PlannerMemoryResponse;
  suggestedAction?: string;
}) {
  await appendMutationEvent(`recommendation.${input.response}` as const, {
    recommendationId: input.recommendation.id,
    type: input.recommendation.type,
    title: input.recommendation.title
  });
  return appendPlannerMemory({
    recommendationId: input.recommendation.id,
    recommendationType: input.recommendation.type,
    userIntention: input.userIntention,
    suggestedAction: input.suggestedAction ?? input.recommendation.tinyAction,
    userResponse: input.response
  });
}
