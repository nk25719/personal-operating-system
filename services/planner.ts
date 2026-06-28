import { AppData, Habit, HealthProfile, IconResearchItem, Project, RoutineItem } from '../types';

const lower = (v: string) => v.toLowerCase();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export function buildLocalPlan(data: AppData) {
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const desire = lower(`${active.desiredPerson ?? ''} ${active.identity}`);
  const obligations = lower(active.dailyObligations ?? '');
  const health = active.healthProfile;
  const environment = active.environmentProfile;
  const healthText = lower(`${health?.medicalConditions ?? ''} ${health?.physicalLimitations ?? ''} ${health?.sleepIssues ?? ''} ${health?.mentalHealthConsiderations ?? ''} ${health?.painOrEnergyNotes ?? ''} ${health?.clinicianGuidance ?? ''}`);

  const habits: Habit[] = [];
  const projects: Project[] = [];
  const icons: IconResearchItem[] = [];

  if (desire.includes('engineer') || desire.includes('technical') || desire.includes('biomedical')) {
    habits.push({ id: id('habit-tech'), name: 'Technical mastery block', frequency: 'Workdays', minimum: '20 minutes', why: 'Career mastery and confidence' });
    projects.push({ id: id('project-tech'), name: 'Technical mastery roadmap', area: 'Career', status: 'Active', nextAction: 'Pick one topic for this week and define the smallest lesson', why: 'Become the person who can solve complex biomedical systems problems', progress: 0 });
    icons.push({ id: id('icon-engineer'), name: 'Limor Fried', domain: 'Engineering builder', whyRelevant: 'A useful icon for combining engineering, documentation, education, and product thinking.', habitsToModel: ['Build small prototypes', 'Document what you build', 'Teach while learning'], searchQueries: ['Limor Fried engineering routine', 'Adafruit open hardware documentation practices'] });
  }

  if (desire.includes('research') || desire.includes('publish') || desire.includes('paper')) {
    habits.push({ id: id('habit-paper'), name: 'Paper progress', frequency: '3x/week', minimum: '100 words or one reference', why: 'Build researcher identity through repeated evidence of progress' });
    projects.push({ id: id('project-paper'), name: 'Research publication pipeline', area: 'Research', status: 'Active', nextAction: 'Write the next 100 words or summarize one paper', why: 'Credibility, contribution, and long-term expert identity', progress: 0 });
    icons.push({ id: id('icon-research'), name: 'Marie Curie', domain: 'Research discipline', whyRelevant: 'A strong model for patient, focused scientific work over years.', habitsToModel: ['Keep research notes', 'Protect deep work', 'Persist through unclear results'], searchQueries: ['Marie Curie research habits daily routine', 'scientist research notebook habits'] });
  }

  if (desire.includes('german') || desire.includes('relocat') || desire.includes('germany') || desire.includes('freedom')) {
    habits.push({ id: id('habit-language'), name: 'Language reps', frequency: 'Daily', minimum: '15 minutes', why: 'Relocation and future freedom' });
    projects.push({ id: id('project-future'), name: 'Relocation readiness', area: 'Future', status: 'Active', nextAction: 'Practice German today and keep a document of requirements', why: 'Move closer to independence and international work', progress: 0 });
  }

  if (desire.includes('health') || desire.includes('strong') || obligations.includes('gym') || obligations.includes('pool')) {
    const movement = adaptiveMovementMinimum(health);
    habits.push({ id: id('habit-body'), name: 'Daily body activation', frequency: 'Daily', minimum: movement.minimum, why: movement.why });
    projects.push({ id: id('project-health'), name: 'Health system', area: 'Body', status: 'Active', nextAction: obligations.includes('weekend') ? movement.weekendAction : movement.generalAction, why: 'A strong life needs a strong body, adapted to the person’s real constraints', progress: 0 });
  }

  if (desire.includes('service') || obligations.includes('volunteer')) {
    habits.push({ id: id('habit-recovery'), name: 'Evening recovery boundary', frequency: 'Daily', minimum: healthText.includes('burnout') || healthText.includes('stress') || healthText.includes('anxiety') ? '15 minutes quiet reset after service' : '10 minutes quiet reset after service', why: 'Serve without burning out' });
  }

  if (health?.enabled) {
    habits.push(...buildHealthAwareHabits(health));
  }

  if (environment?.enabled) {
    habits.push({ id: id('habit-integrity'), name: 'Integrity check', frequency: 'Daily', minimum: '1 minute: did my actions match my values today?', why: 'Measures alignment between stated purpose and lived behavior' });
    habits.push({ id: id('habit-environment'), name: 'Environment design', frequency: 'Weekly', minimum: 'Choose one environment or person to seek, and one to limit', why: 'Character is shaped by repeated surroundings' });
    projects.push({ id: id('project-environment'), name: 'Future-self environment map', area: 'Character', status: 'Active', nextAction: 'Plan one experience this week that exposes you to the person you are becoming', why: 'Intentionally choose places, people, and experiences that build character', progress: 0 });
  }

  const routine: RoutineItem[] = [
    { id: id('routine-wake'), time: '05:30', title: 'Wake up + water', category: 'Body' },
    { id: id('routine-body'), time: '05:35-05:50', title: 'Run / yoga / stretch', category: 'Body' },
    { id: id('routine-shower'), time: '05:50-06:20', title: 'Shower + prep', category: 'Body' },
    { id: id('routine-meditate'), time: '06:20-06:40', title: 'Heart meditation', category: 'Mind' },
    { id: id('routine-journal'), time: '06:40-06:50', title: 'Journal', category: 'Mind' },
    { id: id('routine-language'), time: '06:50-07:05', title: 'Language practice', category: 'Language' },
    { id: id('routine-breakfast'), time: '07:05-07:25', title: 'Breakfast + learning audio/reading', category: 'Reading' },
    { id: id('routine-read'), time: '07:25-07:45', title: 'Reading', category: 'Reading' },
    { id: id('routine-work'), time: obligations.includes('8') ? '08:00-17:00' : 'Work block', title: 'Main work obligation', category: 'Work' },
    { id: id('routine-tech'), time: 'During work', title: 'Professional technical study block', category: 'Learning' },
    { id: id('routine-service'), time: obligations.includes('19') || obligations.includes('7') ? '19:00-22:00' : 'Evening', title: 'Service / volunteering / important obligation', category: 'Service' },
    { id: id('routine-sleep'), time: '22:30', title: 'Sleep', category: 'Rest' }
  ];

  return { routine, habits, projects, icons };
}

function adaptiveMovementMinimum(health?: HealthProfile) {
  if (!health?.enabled) return { minimum: '10 minutes stretch/yoga/run', why: 'Protect energy, mood, and discipline', weekendAction: 'Keep weekday micro-movement and weekend gym/pool', generalAction: 'Schedule two realistic training sessions' };
  const blob = lower(`${health.medicalConditions} ${health.physicalLimitations} ${health.clinicianGuidance}`);
  if (health.habitIntensity === 'gentle' || blob.includes('knee') || blob.includes('arthritis') || blob.includes('back pain') || blob.includes('pregnant') || health.pregnancyStatus === 'pregnant' || health.pregnancyStatus === 'postpartum') {
    return { minimum: '5-10 minutes gentle mobility, walking, or clinician-approved movement', why: 'Protect energy without ignoring health constraints', weekendAction: 'Choose low-impact gym/pool or recovery based on body state', generalAction: 'Schedule gentle movement and respect clinician guidance' };
  }
  if (blob.includes('asthma') || blob.includes('breath')) {
    return { minimum: '10 minutes gentle warmup, stretch, or easy walk', why: 'Build consistency while respecting breathing limits', weekendAction: 'Use gradual warmup before gym/pool', generalAction: 'Schedule moderate movement with gradual warmup' };
  }
  return { minimum: '10 minutes stretch/yoga/walk/run depending on energy', why: 'Adapt movement to health and energy', weekendAction: 'Keep weekday micro-movement and weekend gym/pool', generalAction: 'Schedule two realistic training sessions' };
}

function buildHealthAwareHabits(health: HealthProfile): Habit[] {
  const habits: Habit[] = [];
  const blob = lower(`${health.medicalConditions} ${health.physicalLimitations} ${health.sleepIssues} ${health.mentalHealthConsiderations} ${health.painOrEnergyNotes} ${health.clinicianGuidance}`);
  habits.push({ id: id('habit-health-check'), name: 'Health check-in', frequency: 'Daily', minimum: '30 seconds: energy, pain, mood, sleep', why: 'Let the POS adapt today instead of forcing yesterday’s plan' });
  if (blob.includes('adhd') || blob.includes('focus')) habits.push({ id: id('habit-focus'), name: 'Focus sprint', frequency: 'Workdays', minimum: '10-25 minutes with visible next action', why: 'Support attention with short, clear execution blocks' });
  if (blob.includes('anxiety') || blob.includes('stress') || blob.includes('burnout')) habits.push({ id: id('habit-nervous-system'), name: 'Nervous-system reset', frequency: 'Daily', minimum: '5 minutes breathing, journaling, or quiet walk', why: 'Reduce overload and keep plans sustainable' });
  if (blob.includes('insomnia') || blob.includes('sleep')) habits.push({ id: id('habit-sleep'), name: 'Sleep protection', frequency: 'Daily', minimum: '10 minute wind-down and no new commitments late at night', why: 'Protect recovery as a productivity constraint' });
  if (blob.includes('diabetes') || blob.includes('glucose')) habits.push({ id: id('habit-glucose-safe'), name: 'Workout safety check', frequency: 'Before exercise', minimum: 'Follow personal clinician-approved glucose routine', why: 'Avoid generic fasting or intense workout assumptions' });
  if (health.dietaryPreferences.trim()) habits.push({ id: id('habit-food-fit'), name: 'Food preference check', frequency: 'Weekly', minimum: 'Plan meals that match restrictions/preferences', why: 'Make food habits realistic and safe' });
  return habits;
}

export async function generatePlan(data: AppData) {
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const key = data.integrations.aiApiKey.trim();
  const local = buildLocalPlan(data);
  if (!key) return local;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: data.integrations.aiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate a practical personal operating system plan. Return only valid JSON with keys routine, habits, projects, icons. Use the exact fields from this TypeScript shape: routine[{time,title,category}], habits[{name,frequency,minimum,why,reminderTime}], projects[{name,area,status,nextAction,why,progress}], icons[{name,domain,whyRelevant,habitsToModel,searchQueries}]. Categories must be Body, Mind, Language, Reading, Work, Service, Home, Learning, Rest. Status Active/Paused/Done. Suggest role-model icons and web search queries; do not invent precise facts.' },
        { role: 'user', content: `Person: ${active.name}\nIdentity: ${active.identity}\nWanted person: ${active.desiredPerson}\nObligations: ${active.dailyObligations}\nValues: ${active.values.join(', ')}
Health enabled: ${active.healthProfile?.enabled ? 'yes' : 'no'}
Health context: ${active.healthProfile ? JSON.stringify(active.healthProfile) : 'none'}
Environment and integrity context: ${active.environmentProfile ? JSON.stringify(active.environmentProfile) : 'none'}
Safety: Adapt habits to health constraints but do not diagnose, treat, prescribe, or give medical advice. Encourage clinician guidance for medical decisions.` }
      ]
    })
  });
  const json = await response.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) return local;
  try {
    const parsed = JSON.parse(text);
    return {
      routine: (parsed.routine ?? []).map((r: any) => ({ id: id('routine'), ...r })),
      habits: (parsed.habits ?? []).map((h: any) => ({ id: id('habit'), ...h })),
      projects: (parsed.projects ?? []).map((p: any) => ({ id: id('project'), status: p.status ?? 'Active', progress: Number(p.progress ?? 0), ...p })),
      icons: (parsed.icons ?? []).map((i: any) => ({ id: id('icon'), ...i }))
    };
  } catch {
    return local;
  }
}

export function applyGeneratedPlan(data: AppData, plan: ReturnType<typeof buildLocalPlan>): AppData {
  return {
    ...data,
    routine: plan.routine,
    habits: [...data.habits, ...plan.habits],
    projects: [...data.projects, ...plan.projects],
    iconResearch: [...(data.iconResearch ?? []), ...plan.icons]
  };
}
