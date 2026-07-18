import { AppData, CaptureEntry, ModuleKey, MotivationCheckIn, MotivationNeed, PlannerMemoryRecord, Project, Recommendation, RoutineItem, Task } from '../types';
import { buildContractRecommendation } from './recommendationContract';

const todayKey = () => new Date().toISOString().slice(0, 10);

export function activeCharacter(data: AppData) {
  return data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
}


export function preferredName(data: AppData) {
  const active = activeCharacter(data);
  return data.preferences?.preferredName || active.name?.split(' ')[0] || 'there';
}

export function personalPrompt(data: AppData, offset = 0) {
  const prompts = data.preferences?.rotatingPrompts?.length
    ? data.preferences.rotatingPrompts
    : [activeCharacter(data).missionQuestion || 'What would move you closer to the person you are becoming today?'];
  const dayIndex = Math.floor(Date.now() / 86400000);
  return prompts[(dayIndex + offset) % prompts.length];
}

export function openTasks(data: AppData): Task[] {
  return (data.tasks ?? [])
    .filter(task => task.status !== 'Done')
    .sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 } as const;
      return rank[a.priority] - rank[b.priority];
    });
}

export function nextTask(data: AppData): Task | undefined {
  return openTasks(data)[0];
}

export function enabledModules(data: AppData) {
  const active = activeCharacter(data);
  return (data.modules ?? []).filter(module => {
    if (!module.enabled) return false;
    if (module.key === 'womenHealth') return !!active.demographics?.showWomenHealth && data.womenHealth.enabled;
    if (module.key === 'health') return !!active.healthProfile?.enabled;
    if (module.key === 'environment') return !!active.environmentProfile?.enabled;
    return true;
  });
}

export function visibleRoutine(data: AppData) {
  return data.routine.filter(item => !['technical'].includes(item.id));
}

export function getNextAction(data: AppData, done: Record<string, boolean>) {
  const routine = visibleRoutine(data);
  const nextRoutine = routine.find(item => !done[item.id]);
  if (nextRoutine) return { label: nextRoutine.title, detail: nextRoutine.time, source: 'Today routine' };
  const task = nextTask(data);
  if (task) return { label: task.title, detail: task.estimatedMinutes ? `${task.estimatedMinutes} min` : task.area, source: 'Task' };
  const activeProject = data.projects.find(p => p.status === 'Active' && p.progress < 100);
  if (activeProject) return { label: activeProject.nextAction, detail: activeProject.name, source: 'Project' };
  return { label: 'Rest and prepare tomorrow', detail: 'The visible plan is complete.', source: 'Recovery' };
}

export function discretionaryTimeEstimate(data: AppData) {
  const obligations = activeCharacter(data).dailyObligations?.toLowerCase() ?? '';
  if (obligations.includes('volunteer') && obligations.includes('8')) return '1-2h';
  if (obligations.includes('work')) return '2-3h';
  return 'Flexible';
}

export function alignmentScore(data: AppData) {
  const projects = data.projects.filter(p => p.status === 'Active');
  const avgProgress = projects.length ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;
  const moduleBonus = enabledModules(data).length >= 4 ? 10 : 0;
  return Math.min(100, Math.round(avgProgress * 0.8 + moduleBonus + 20));
}

export function projectBlockers(data: AppData) {
  return data.projects.filter(p => p.status === 'Active' && p.progress < 30).slice(0, 3);
}

export function extractActionsFromCapture(text: string): CaptureEntry {
  const lines = text.split(/\n|\.|;/).map(x => x.trim()).filter(Boolean);
  const extractedActions = lines
    .filter(line => /need|must|should|remind|finish|call|buy|study|write|check|schedule|prepare|apply/i.test(line))
    .slice(0, 6);
  const lower = text.toLowerCase();
  let suggestedModule: ModuleKey | undefined;
  if (/period|cycle|fertility|child|pregnan/.test(lower)) suggestedModule = 'womenHealth';
  else if (/sick|illness|doctor|health|pain|sleep|medication/.test(lower)) suggestedModule = 'health';
  else if (/friend|people|environment|integrity|values|purpose/.test(lower)) suggestedModule = 'environment';
  else if (/learn|study|course|dicom|hl7|network/.test(lower)) suggestedModule = 'learning';
  else if (/project|paper|krake|build|publish/.test(lower)) suggestedModule = 'projects';
  else if (/buy|purchase|outing|decision|money/.test(lower)) suggestedModule = 'decision';
  return { id: `capture-${Date.now()}`, createdAt: new Date().toISOString(), text, extractedActions, suggestedModule };
}

export function suggestNextFromCapture(entry: CaptureEntry) {
  if (entry.extractedActions.length) return entry.extractedActions[0];
  return 'Turn this note into one small next action.';
}

export function todayStorageKey() {
  return `today-${todayKey()}`;
}

export function motivationStorageKey() {
  return `motivation-${todayKey()}`;
}

export function defaultMotivationCheckIn(): MotivationCheckIn {
  return { autonomy: 3, competence: 3, relatedness: 3 };
}

export function motivationAverage(checkIn: MotivationCheckIn) {
  return Math.round(((checkIn.autonomy + checkIn.competence + checkIn.relatedness) / 15) * 100);
}

export function lowestMotivationNeed(checkIn: MotivationCheckIn): MotivationNeed {
  const entries: [MotivationNeed, number][] = [
    ['autonomy', checkIn.autonomy],
    ['competence', checkIn.competence],
    ['relatedness', checkIn.relatedness]
  ];
  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

export function motivationAdjustment(checkIn: MotivationCheckIn) {
  const lowest = lowestMotivationNeed(checkIn);
  if (lowest === 'autonomy') {
    return {
      title: 'Restore choice',
      summary: 'The best next step is one you can honestly choose, not one you obey.',
      evidence: 'Your agency check shows choice needs more support today.',
      tinyAction: 'Rewrite the next action in your own words.',
      action: { id: 'modify' as const, label: 'Make it mine' }
    };
  }
  if (lowest === 'competence') {
    return {
      title: 'Lower the difficulty',
      summary: 'Make the next action tiny enough that starting feels realistic.',
      evidence: 'Your agency check shows the plan may need a lower-friction version.',
      tinyAction: 'Do two minutes or one visible step.',
      action: { id: 'modify' as const, label: 'Shrink it' }
    };
  }
  return {
    title: 'Add a relationship cue',
    summary: 'Choose one small action that reconnects you with support, care, or accountability.',
    evidence: 'Your agency check shows relatedness could use attention today.',
    tinyAction: 'Send one short check-in or name who this action serves.',
    action: { id: 'modify' as const, label: 'Add support' }
  };
}

export function topProjects(data: AppData): Project[] {
  return data.projects.filter(p => p.status === 'Active').sort((a, b) => a.progress - b.progress).slice(0, 3);
}

export function routineWithoutMaintenance(routine: RoutineItem[]) {
  return routine.filter(item => !['technical'].includes(item.id));
}

export function getMockRecommendations(data: AppData, checkIn: MotivationCheckIn = defaultMotivationCheckIn(), plannerMemory: PlannerMemoryRecord[] = []): Recommendation[] {
  const active = activeCharacter(data);
  const nextProject = data.projects.find(project => project.status === 'Active') ?? data.projects[0];
  const nextHabit = data.habits.find(habit => habit.frequency !== 'Monthly') ?? data.habits[0];
  const lowestNeed = lowestMotivationNeed(checkIn);
  const adjustment = motivationAdjustment(checkIn);
  const score = motivationAverage(checkIn);

  return applyRecommendationLearning([
    buildContractRecommendation('local-recommendation-1', {
      source: 'local_rules',
      userIntent: active.missionQuestion,
      motivation: checkIn,
      candidate: {
        type: lowestNeed === 'relatedness' ? 'relationship_checkin' : 'project_next_action',
        title: adjustment.title,
        summary: adjustment.summary,
        whyItMatters: 'Self-directed effort lasts longer than compliance. This keeps the plan aligned with choice, doable progress, and support.',
        whyToday: adjustment.evidence,
        tinyAction: adjustment.tinyAction,
        userOverride: 'Dismiss this if it feels irrelevant, or choose Modify to make the plan fit your real day.',
        linkedIdentity: active.identity,
        linkedGoal: 'Build a life that feels chosen, useful, and calm.',
        linkedProject: nextProject?.name,
        evidence: [adjustment.evidence, `Agency support is at ${score}%.`, 'The current routine is intentionally small.'],
        confidence: 78,
        assumptions: ['You want support, not pressure.', 'A smaller action is more useful than a perfect plan you resent.'],
        knowledgeLimits: ['This uses local check-in data only.', 'It does not know your full context unless you capture it.'],
        actions: [
          { id: 'accept', label: 'Use this' },
          adjustment.action,
          { id: 'dismiss', label: 'Dismiss' },
          { id: 'snooze', label: 'Snooze' }
        ]
      }
    }),
    buildContractRecommendation('local-recommendation-2', {
      source: 'local_rules',
      userIntent: active.missionQuestion,
      motivation: checkIn,
      candidate: {
        type: 'habit_recovery',
        title: 'A gentle recovery path',
        summary: `If ${nextHabit?.name ?? 'a habit'} slipped today, return with a small re-entry instead of a penalty.`,
        whyItMatters: 'Recovery preserves identity better than guilt and keeps the habit durable.',
        whyToday: 'A small restart is useful when the day already has enough pressure.',
        tinyAction: `Do the minimum version of ${nextHabit?.name ?? 'one habit'} once.`,
        userOverride: 'Dismiss this if recovery is not needed today, or adjust the habit to something smaller.',
        linkedIdentity: active.name,
        linkedGoal: 'Stay steady without turning growth into pressure.',
        evidence: ['The habit is already part of your weekly rhythm.', 'A small restart is easier to sustain than a dramatic reset.'],
        confidence: 74,
        assumptions: ['You are trying to build consistency, not perform perfectly.', 'The current context may be busy or low-energy.'],
        knowledgeLimits: ['This does not infer health conditions or emotional state.', 'It may not fit every schedule.'],
        actions: [
          { id: 'accept', label: 'Use this' },
          { id: 'modify', label: 'Adjust' },
          { id: 'dismiss', label: 'Not now' },
          { id: 'snooze', label: 'Later' }
        ]
      }
    })
  ], plannerMemory);
}

export function applyRecommendationLearning(recommendations: Recommendation[], plannerMemory: PlannerMemoryRecord[]): Recommendation[] {
  return recommendations
    .map(recommendation => {
      const related = plannerMemory.filter(record => record.recommendationType === recommendation.type || record.recommendationId === recommendation.id);
      const accepted = related.filter(record => record.userResponse === 'accepted' || record.userResponse === 'modified').length;
      const dismissed = related.filter(record => record.userResponse === 'dismissed').length;
      const confidenceShift = Math.min(10, accepted * 3) - Math.min(20, dismissed * 6);
      const learnedEvidence = related.length
        ? [`Recent responses to this kind: ${accepted} accepted/modified, ${dismissed} dismissed.`]
        : [];
      return {
        ...recommendation,
        confidence: Math.max(20, Math.min(95, recommendation.confidence + confidenceShift)),
        evidence: [...recommendation.evidence, ...learnedEvidence],
        priorityScore: recommendation.confidence + accepted * 8 - dismissed * 18
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map(({ priorityScore: _priorityScore, ...recommendation }) => recommendation);
}
