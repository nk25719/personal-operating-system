const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const memoryStorage = new Map();
const secureStorage = new Map();

const asyncStorageMock = {
  async getItem(key) {
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  },
  async setItem(key, value) {
    memoryStorage.set(key, value);
  },
  async removeItem(key) {
    memoryStorage.delete(key);
  }
};

const secureStoreMock = {
  async getItemAsync(key) {
    return secureStorage.has(key) ? secureStorage.get(key) : null;
  },
  async setItemAsync(key, value) {
    secureStorage.set(key, value);
  },
  async deleteItemAsync(key) {
    secureStorage.delete(key);
  }
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: asyncStorageMock };
  }
  if (request === 'expo-secure-store') {
    return secureStoreMock;
  }
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = (module, filename) => {
  const source = require('node:fs').readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filename
  });
  module._compile(output.outputText, filename);
};

function fromRoot(relativePath) {
  return require(path.join(__dirname, '..', relativePath));
}

test.beforeEach(() => {
  memoryStorage.clear();
  secureStorage.clear();
});

test('storage sanitizes and migrates legacy integration secrets', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getAppData, setAppData } = fromRoot('utils/storage.ts');
  const { getIntegrationSecrets } = fromRoot('utils/secrets.ts');

  await asyncStorageMock.setItem('pos-app-data-v2', JSON.stringify({
    ...defaultData,
    integrations: {
      ...defaultData.integrations,
      aiApiKey: 'sk-test',
      notionToken: 'notion-secret',
      notionDatabaseId: 'db-1'
    }
  }));

  const loaded = await getAppData();
  assert.equal(loaded.integrations.notionDatabaseId, 'db-1');
  assert.equal(Object.hasOwn(loaded.integrations, 'aiApiKey'), false);
  assert.equal(Object.hasOwn(loaded.integrations, 'notionToken'), false);
  assert.deepEqual(await getIntegrationSecrets(), { openaiApiKey: 'sk-test', notionToken: 'notion-secret' });

  await setAppData(loaded);
  const persisted = JSON.parse(await asyncStorageMock.getItem('pos-app-data-v2'));
  assert.equal(Object.hasOwn(persisted.integrations, 'aiApiKey'), false);
  assert.equal(Object.hasOwn(persisted.integrations, 'notionToken'), false);
});

test('mutation helpers update data and characters without leaking secrets', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { applyDataUpdate, applyCharacterUpdate } = fromRoot('utils/mutations.ts');
  const { sanitizeAppData } = fromRoot('utils/storage.ts');

  const withTask = applyDataUpdate(defaultData, current => ({
    ...current,
    tasks: [{ ...current.tasks[0], id: 'task-new', title: 'New safe task' }, ...current.tasks]
  }));
  assert.equal(withTask.tasks[0].id, 'task-new');

  const updatedCharacter = applyCharacterUpdate(withTask, defaultData.activeCharacterId, { name: 'Updated human' });
  assert.equal(updatedCharacter.characters[0].name, 'Updated human');

  const sanitized = sanitizeAppData({
    ...updatedCharacter,
    integrations: { ...updatedCharacter.integrations, aiApiKey: 'sk-nope', notionToken: 'secret-nope' }
  });
  assert.equal(Object.hasOwn(sanitized.integrations, 'aiApiKey'), false);
  assert.equal(Object.hasOwn(sanitized.integrations, 'notionToken'), false);
});

test('onboarding stores first-launch preferences and creates one tiny habit', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { applyOnboarding, shouldShowOnboarding } = fromRoot('services/onboarding.ts');

  assert.equal(shouldShowOnboarding(defaultData), true);
  const next = applyOnboarding(defaultData, {
    desiredPerson: 'A steady researcher who keeps small promises',
    currentSeason: 'Busy work season with protected evenings',
    values: ['Health', 'Mastery', 'Freedom', 'Extra'],
    tinyHabit: 'Read one paragraph after dinner',
    tone: 'practical'
  }, 123);

  assert.equal(shouldShowOnboarding(next), false);
  assert.equal(next.preferences.onboardingCompleted, true);
  assert.equal(next.preferences.currentSeason, 'Busy work season with protected evenings');
  assert.equal(next.preferences.tone, 'practical');
  assert.equal(next.characters[0].desiredPerson, 'A steady researcher who keeps small promises');
  assert.deepEqual(next.characters[0].values, ['Health', 'Mastery', 'Freedom']);
  assert.equal(next.habits[0].id, 'habit-onboarding-123');
  assert.equal(next.habits[0].name, 'Read one paragraph after dinner');
});

test('event log records lightweight local mutation events', async () => {
  const { appendMutationEvent, appendPlannerMemory, getMutationEvents, getPlannerMemory } = fromRoot('utils/storage.ts');

  await appendMutationEvent('task.created', { taskId: 'task-1' });
  await appendMutationEvent('capture.saved', { captureId: 'capture-1' });
  await appendMutationEvent('connection.done', { prompt: 'Check in with one person today.' });
  await appendPlannerMemory({
    recommendationId: 'rec-1',
    userIntention: 'Move toward the person I choose to become',
    suggestedAction: 'Do one tiny step',
    userResponse: 'accepted'
  });
  const events = await getMutationEvents();
  const memory = await getPlannerMemory();

  assert.deepEqual(events.map(event => event.type), ['connection.done', 'capture.saved', 'task.created']);
  assert.equal(events[0].payload.prompt, 'Check in with one person today.');
  assert.equal(memory[0].userResponse, 'accepted');
  assert.equal(memory[0].suggestedAction, 'Do one tiny step');
});

test('export, preview, and import backup use schema version and exclude secrets', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { exportAppBackup, importAppBackup, previewAppBackup, setAppData } = fromRoot('utils/storage.ts');

  await setAppData({
    ...defaultData,
    integrations: { ...defaultData.integrations, aiApiKey: 'sk-export', notionToken: 'notion-export' }
  });
  const backup = await exportAppBackup();
  assert.equal(backup.includes('sk-export'), false);
  assert.equal(backup.includes('notion-export'), false);
  const parsed = JSON.parse(backup);
  assert.equal(parsed.schemaVersion, 1);

  const preview = previewAppBackup(backup);
  assert.equal(preview.charactersCount, defaultData.characters.length);
  assert.equal(preview.habitsCount, defaultData.habits.length);
  assert.equal(preview.projectsCount, defaultData.projects.length);
  assert.equal(preview.tasksCount, defaultData.tasks.length);
  assert.match(preview.warning, /replace the current local POS data/);

  const imported = await importAppBackup(backup);
  assert.equal(Object.hasOwn(imported.integrations, 'aiApiKey'), false);
  assert.equal(Object.hasOwn(imported.integrations, 'notionToken'), false);
});

test('backup can be exported, reset, previewed, and restored', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { exportAppBackup, getAppData, importAppBackup, previewAppBackup, resetAppData, setAppData } = fromRoot('utils/storage.ts');

  const original = {
    ...defaultData,
    preferences: { ...defaultData.preferences, onboardingCompleted: true, currentSeason: 'Restoring test season' },
    tasks: [{ ...defaultData.tasks[0], id: 'task-restore-check', title: 'Restore this task' }],
    habits: [{ ...defaultData.habits[0], id: 'habit-restore-check', name: 'Restore this habit' }],
    projects: [{ ...defaultData.projects[0], id: 'project-restore-check', name: 'Restore this project' }]
  };
  await setAppData(original);

  const backup = await exportAppBackup();
  await resetAppData();
  assert.notEqual((await getAppData()).tasks[0].id, 'task-restore-check');

  const preview = previewAppBackup(backup);
  assert.equal(preview.habitsCount, 1);
  assert.equal(preview.projectsCount, 1);
  assert.equal(preview.tasksCount, 1);

  const restored = await importAppBackup(backup);
  assert.equal(restored.preferences.currentSeason, 'Restoring test season');
  assert.equal(restored.tasks[0].title, 'Restore this task');
  assert.equal(restored.habits[0].name, 'Restore this habit');
  assert.equal(restored.projects[0].name, 'Restore this project');
});

test('planner falls back locally when no OpenAI key exists', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { generatePlan } = fromRoot('services/planner.ts');

  const plan = await generatePlan(defaultData);
  assert.ok(plan.routine.length > 0);
  assert.ok(plan.habits.some(habit => habit.name.includes('Technical') || habit.name.includes('Paper')));
  assert.ok(plan.projects.length > 0);
});

test('capture extraction finds actions and module suggestions', () => {
  const { extractActionsFromCapture, suggestNextFromCapture } = fromRoot('services/os.ts');

  const entry = extractActionsFromCapture('I should study DICOM tonight. Also buy toiletries; avoid late nights.');
  assert.equal(entry.suggestedModule, 'learning');
  assert.ok(entry.extractedActions.some(action => action.includes('study DICOM')));
  assert.equal(suggestNextFromCapture(entry), entry.extractedActions[0]);
});

test('today recommendation follows the recommendation contract', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');

  const recommendations = getMockRecommendations(defaultData, { autonomy: 1, competence: 4, relatedness: 4 });
  const first = recommendations[0];
  assert.equal(first.title, 'Restore choice');
  assert.ok(first.whyToday);
  assert.ok(first.tinyAction);
  assert.ok(first.userOverride);
  assert.ok(first.evidence.length >= 3);
  assert.ok(first.assumptions.length > 0);
  assert.ok(first.knowledgeLimits.length > 0);
  assert.deepEqual(first.actions.map(action => action.id), ['accept', 'modify', 'dismiss', 'snooze']);
});

test('today recommendation filter excludes relationship cues', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');
  const { isRelationshipCue } = fromRoot('services/relationshipCue.ts');

  const recommendations = getMockRecommendations(defaultData, { autonomy: 4, competence: 4, relatedness: 1 });
  assert.ok(recommendations.some(isRelationshipCue));
  const todayRecommendations = recommendations.filter(recommendation => !isRelationshipCue(recommendation));
  assert.equal(todayRecommendations.some(recommendation => /relationship|relatedness|check-in|name who this action serves/i.test([
    recommendation.title,
    recommendation.summary,
    recommendation.whyToday,
    recommendation.tinyAction
  ].join(' '))), false);
});

test('relationship cue detection catches legacy mismatched recommendation type', () => {
  const { isRelationshipCue } = fromRoot('services/relationshipCue.ts');
  assert.equal(isRelationshipCue({
    id: 'legacy',
    type: 'project_next_action',
    title: 'Add a relationship cue',
    summary: 'Choose support.',
    whyItMatters: 'Support matters.',
    whyToday: 'Your agency check shows relatedness could use attention today.',
    tinyAction: 'Send one short check-in or name who this action serves.',
    userOverride: 'Dismiss.',
    evidence: [],
    confidence: 50,
    assumptions: [],
    knowledgeLimits: [],
    actions: []
  }), true);
});

test('today presentation detects duplicate habit recommendations', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');
  const { getNextHourItems, getNextSmallActionItem, getSmallStep, getTodayVisibleRecommendation, isRecommendationForHabit } = fromRoot('services/todayPresentation.ts');

  const habit = defaultData.habits[0];
  const habitRecommendation = getMockRecommendations(defaultData).find(recommendation => recommendation.type === 'habit_recovery');
  assert.equal(isRecommendationForHabit(habitRecommendation, habit), true);
  assert.equal(getSmallStep(habitRecommendation, habit), 'Do 1 small movement or stretch.');
  assert.equal(getTodayVisibleRecommendation([habitRecommendation], habit), undefined);

  const nextHour = getNextHourItems(defaultData.routine, new Date('2026-07-18T06:30:00'));
  assert.ok(nextHour.some(item => item.title === 'German practice'));

  const nextSmallAction = getNextSmallActionItem(defaultData.routine, { wake: true, movement: true });
  assert.equal(nextSmallAction.title, 'Shower + prep');
});

test('habit streak helper counts consecutive completion days safely', () => {
  const { calculateHabitStreak, formatConsecutiveCompletion, formatStreak } = fromRoot('services/streaks.ts');
  const events = [
    { id: '1', type: 'habit.completed', createdAt: '2026-07-18T08:00:00.000Z', payload: { itemId: 'movement' } },
    { id: '2', type: 'habit.completed', createdAt: '2026-07-17T08:00:00.000Z', payload: { itemId: 'movement' } },
    { id: '3', type: 'habit.completed', createdAt: '2026-07-16T08:00:00.000Z', payload: { itemId: 'movement' } },
    { id: '4', type: 'habit.completed', createdAt: '2026-07-14T08:00:00.000Z', payload: { itemId: 'movement' } },
    { id: '5', type: 'habit.completed', createdAt: '2026-07-18T08:00:00.000Z', payload: { itemId: 'journal' } }
  ];

  assert.equal(calculateHabitStreak(events, 'movement', new Date('2026-07-18T12:00:00.000Z')), 3);
  assert.equal(formatStreak(3), '3-day streak');
  assert.equal(formatConsecutiveCompletion(3), 'Completed 3 days in a row');
  assert.equal(formatStreak(0), 'Start today');
});

test('recommendation response recording writes event and planner memory', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');
  const { recordRecommendationResponse } = fromRoot('services/plannerMemory.ts');
  const { getMutationEvents, getPlannerMemory } = fromRoot('utils/storage.ts');

  const recommendation = getMockRecommendations(defaultData)[0];
  await recordRecommendationResponse({
    recommendation,
    userIntention: 'Choose the next useful action',
    response: 'modified',
    suggestedAction: 'Read one paragraph'
  });

  const events = await getMutationEvents();
  const memory = await getPlannerMemory();
  assert.equal(events[0].type, 'recommendation.modified');
  assert.equal(events[0].payload.type, recommendation.type);
  assert.equal(memory[0].recommendationType, recommendation.type);
  assert.equal(memory[0].suggestedAction, 'Read one paragraph');
  assert.equal(memory[0].userResponse, 'modified');
});

test('recommendation learning lowers repeatedly dismissed types', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');

  const withoutMemory = getMockRecommendations(defaultData);
  const dismissedProjectMemory = Array.from({ length: 3 }, (_, index) => ({
    id: `memory-${index}`,
    createdAt: new Date().toISOString(),
    recommendationId: `old-${index}`,
    recommendationType: 'project_next_action',
    userIntention: 'test',
    suggestedAction: 'test',
    userResponse: 'dismissed'
  }));
  const withMemory = getMockRecommendations(defaultData, undefined, dismissedProjectMemory);

  assert.equal(withoutMemory[0].type, 'project_next_action');
  assert.notEqual(withMemory[0].type, 'project_next_action');
});
