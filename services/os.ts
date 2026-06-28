import { AppData, CaptureEntry, ModuleKey, Project, RoutineItem } from '../types';

const todayKey = () => new Date().toISOString().slice(0, 10);

export function activeCharacter(data: AppData) {
  return data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
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

export function topProjects(data: AppData): Project[] {
  return data.projects.filter(p => p.status === 'Active').sort((a, b) => a.progress - b.progress).slice(0, 3);
}

export function routineWithoutMaintenance(routine: RoutineItem[]) {
  return routine.filter(item => !['technical'].includes(item.id));
}
