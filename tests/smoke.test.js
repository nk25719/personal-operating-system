const assert = require('node:assert/strict');
const fs = require('node:fs');
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
  const source = fs.readFileSync(filename, 'utf8');
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

function routeToFile(route) {
  const routeName = route.replace(/^\//, '') || 'index';
  return path.join(__dirname, '..', 'app', `${routeName}.tsx`);
}

test.beforeEach(() => {
  memoryStorage.clear();
  secureStorage.clear();
});

test('storage sanitizes and migrates legacy integration secrets', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getAppData, getAppDataStorageKey, setAppData, setStorageUser } = fromRoot('utils/storage.ts');
  const { getIntegrationSecrets } = fromRoot('utils/secrets.ts');
  setStorageUser('user-a');

  await asyncStorageMock.setItem(getAppDataStorageKey('user-a'), JSON.stringify({
    ...defaultData,
    integrations: {
      ...defaultData.integrations,
      aiApiKey: 'sk-test',
      notionToken: 'notion-secret',
      notionDatabaseId: 'db-1'
    }
  }));

  const loaded = await getAppData();
  assert.equal(getAppDataStorageKey('user-a'), 'pos-app-data-v2:user-a');
  assert.equal(loaded.integrations.notionDatabaseId, 'db-1');
  assert.equal(Object.hasOwn(loaded.integrations, 'aiApiKey'), false);
  assert.equal(Object.hasOwn(loaded.integrations, 'notionToken'), false);
  assert.deepEqual(await getIntegrationSecrets(), { openaiApiKey: 'sk-test', notionToken: 'notion-secret' });

  await setAppData(loaded);
  const persisted = JSON.parse(await asyncStorageMock.getItem('pos-app-data-v2:user-a'));
  assert.equal(Object.hasOwn(persisted.integrations, 'aiApiKey'), false);
  assert.equal(Object.hasOwn(persisted.integrations, 'notionToken'), false);
});

test('app data storage is scoped per Firebase user', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { getAppData, getAppDataStorageKey, setAppData, setStorageUser } = fromRoot('utils/storage.ts');

  setStorageUser(null);
  assert.equal(await getAppData(), null);
  assert.equal(getAppDataStorageKey(), null);

  setStorageUser('user-a');
  await setAppData({ ...defaultData, preferences: { ...defaultData.preferences, preferredName: 'User A' } });
  setStorageUser('user-b');
  await setAppData({ ...defaultData, preferences: { ...defaultData.preferences, preferredName: 'User B' } });

  assert.equal(JSON.parse(await asyncStorageMock.getItem('pos-app-data-v2:user-a')).preferences.preferredName, 'User A');
  assert.equal(JSON.parse(await asyncStorageMock.getItem('pos-app-data-v2:user-b')).preferences.preferredName, 'User B');
  assert.equal((await getAppData()).preferences.preferredName, 'User B');
});

test('setAppData notifies active user subscribers after onboarding save', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { setAppData, setStorageUser, subscribeToAppData } = fromRoot('utils/storage.ts');
  setStorageUser('notify-user');
  const notifications = [];
  const unsubscribe = subscribeToAppData((data, userId) => {
    notifications.push({ data, userId });
  });

  await setAppData({
    ...defaultData,
    preferences: { ...defaultData.preferences, onboardingCompleted: true, onboardingCompletedAt: '2026-07-19T00:00:00.000Z' }
  });
  unsubscribe();

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].userId, 'notify-user');
  assert.equal(notifications[0].data.preferences.onboardingCompleted, true);
});

test('mutation helpers update data and characters without leaking secrets', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { applyDataUpdate, applyCharacterUpdate } = fromRoot('utils/mutations.ts');
  const { sanitizeAppData } = fromRoot('utils/storage.ts');

  const withTask = applyDataUpdate(defaultData, current => ({
    ...current,
    tasks: [{ id: 'task-new', title: 'New safe task', area: 'Personal', status: 'Todo', priority: 'Medium' }, ...current.tasks]
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

test('buildAppDataFromOnboarding fills required setup contract fields', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { buildAppDataFromOnboarding, onboardingSetupContract, shouldShowOnboarding, validateOnboardingInput } = fromRoot('services/onboarding.ts');

  assert.equal(shouldShowOnboarding(defaultData), true);
  const answers = {
    preferredName: 'N',
    username: 'steady_researcher',
    pronouns: 'she/her',
    desiredPerson: 'A steady researcher',
    currentSeason: 'growing',
    values: ['Health', 'Mastery', 'Freedom', 'Extra'],
    mainAreas: ['learning', 'health'],
    weeklyFocus: 'finish a project',
    energyPattern: 'mixed',
    dailyTimeBudget: '15 min',
    habits: ['Read one paragraph after dinner'],
    startingRoutine: ['Read one paragraph after dinner'],
    recommendedModules: ['learning', 'habits', 'projects'],
    tone: 'structured',
    healthContext: 'Low energy in the morning',
    learningGoal: 'German',
    relationshipPreference: 'Supportive friend'
  };
  const next = buildAppDataFromOnboarding({ uid: 'firebase-user-1', email: 'user@example.com' }, answers, defaultData, 123);

  assert.equal(shouldShowOnboarding(next), false);
  assert.equal(next.preferences.onboardingCompleted, true);
  assert.equal(next.preferences.currentSeason, 'growing');
  assert.equal(next.preferences.tone, 'structured');
  assert.equal(next.preferences.preferredTone, 'structured');
  assert.equal(next.preferences.username, 'steady_researcher');
  assert.equal(next.preferences.weeklyFocus, 'finish a project');
  assert.equal(next.userProfile.authUserId, 'firebase-user-1');
  assert.equal(next.userProfile.email, 'user@example.com');
  assert.equal(next.userProfile.username, 'steady_researcher');
  assert.equal(next.activeCharacterId, 'self');
  assert.equal(next.characters.length, 1);
  assert.equal(next.characters[0].name, 'N');
  assert.equal(next.characters[0].desiredPerson, 'A steady researcher');
  assert.deepEqual(next.characters[0].values, ['Health', 'Mastery', 'Freedom']);
  assert.match(next.characters[0].dailyObligations, /finish a project/);
  assert.equal(next.characters[0].healthProfile.painOrEnergyNotes, 'Low energy in the morning');
  assert.equal(next.habits[0].id, 'habit-onboarding-123');
  assert.equal(next.habits[0].name, 'Read one paragraph after dinner');
  assert.equal(next.habits[0].minimum, 'Read one paragraph after dinner');
  assert.equal(next.routine[0].title, 'Read one paragraph after dinner');
  assert.equal(next.projects[0].name, 'Finish a project');
  assert.equal(next.tasks[0].projectId, next.projects[0].id);
  assert.equal(next.learningTopics[0].name, 'German');
  assert.equal(next.captureInbox.length, 0);
  assert.equal(next.modules.find(module => module.key === 'learning').enabled, true);
  assert.equal(next.modules.find(module => module.key === 'projects').enabled, true);
  assert.equal(next.modules.find(module => module.key === 'health').enabled, false);
  assert.equal(validateOnboardingInput({ ...answers, preferredName: '' }), 'Add your preferred name.');
  assert.ok(onboardingSetupContract.requiredAnswers.includes('startingRoutine'));
  assert.ok(onboardingSetupContract.generatedAppData.includes('authUserId'));
});

test('onboarding completion sets route-guard fields without project when focus is routine', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { applyOnboarding } = fromRoot('services/onboarding.ts');

  const next = applyOnboarding(defaultData, {
    authUserId: 'firebase-user-2',
    email: 'routine@example.com',
    preferredName: 'R',
    username: 'routine_user',
    desiredPerson: 'A steady person',
    currentSeason: 'steady',
    values: ['peace'],
    weeklyFocus: 'build routine',
    energyPattern: 'low',
    dailyTimeBudget: '5 min',
    habits: ['Drink water'],
    startingRoutine: ['Drink water'],
    recommendedModules: ['habits'],
    tone: 'gentle'
  }, 456);

  assert.equal(next.preferences.onboardingCompleted, true);
  assert.ok(next.preferences.onboardingCompletedAt);
  assert.equal(next.userProfile.authUserId, 'firebase-user-2');
  assert.equal(next.activeCharacterId, 'self');
  assert.equal(next.characters.length, 1);
  assert.equal(next.routine.length, 1);
  assert.equal(next.habits[0].minimum, 'Drink water');
  assert.equal(next.projects.length, 0);
  assert.equal(next.captureInbox.length, 0);
});

test('auth error mapper returns readable messages', () => {
  const { getAuthMessage } = fromRoot('services/authErrors.ts');
  assert.equal(getAuthMessage(new Error('Firebase: Error (auth/invalid-email).')), 'Enter a valid email address.');
  assert.equal(getAuthMessage(new Error('Firebase: Error (auth/email-already-in-use).')), 'An account with this email already exists.');
  assert.equal(getAuthMessage(new Error('Firebase: Error (auth/weak-password).')), 'Use a password with at least 6 characters.');
  assert.equal(getAuthMessage(new Error('Firebase: Error (auth/operation-not-allowed).')), 'This sign-in option is not enabled yet.');
  assert.equal(getAuthMessage(new Error('Firebase: Error (auth/invalid-credential).')), 'Email or password is not correct.');
});

test('modules screen manifest restores every POS module route', () => {
  const { moduleCards } = fromRoot('utils/modules.ts');
  const expectedTitles = [
    'Tasks / Actions',
    'Habits',
    'Projects',
    'Capture',
    'Review',
    'Learning',
    'Decision',
    'Health',
    'Women’s Health',
    'Environment',
    'Relationships',
    'Builder / Identity Builder',
    'AI Advisor',
    'Life Clock',
    'Settings',
    'Profile'
  ];

  assert.deepEqual(moduleCards.map(module => module.title), expectedTitles);
  for (const module of moduleCards) {
    assert.ok(module.title);
    assert.ok(module.route.startsWith('/'));
    assert.ok(module.iconKey);
    assert.equal(fs.existsSync(routeToFile(module.route)), true, `${module.route} should have an app route file`);
  }
});

test('module and top-action icon contracts are complete', () => {
  const { appIconFallbacks, appIconRegistry } = fromRoot('utils/icons.ts');
  const { moduleCards } = fromRoot('utils/modules.ts');
  const { topActionItems } = fromRoot('utils/topActions.ts');

  for (const module of moduleCards) {
    assert.ok(Object.hasOwn(appIconRegistry, module.iconKey), `${module.iconKey} should exist in icon registry`);
    assert.ok(appIconFallbacks[module.iconKey], `${module.iconKey} should have a web-safe fallback`);
  }
  assert.deepEqual(topActionItems.map(item => item.label), ['Add to-do', 'Modules', 'Profile', 'Settings']);
  assert.equal(topActionItems.some(item => item.label === 'Modules' && item.href === '/modules'), true);
  assert.equal(topActionItems.some(item => item.label === 'Paste list'), false);
  for (const item of topActionItems.filter(item => item.iconKey)) {
    assert.ok(Object.hasOwn(appIconRegistry, item.iconKey), `${item.iconKey} should exist in icon registry`);
    assert.ok(appIconFallbacks[item.iconKey], `${item.iconKey} should have a web-safe fallback`);
  }
});

test('onboarding suggests habits and modules from setup context', () => {
  const { recommendModules, suggestHabits } = fromRoot('services/onboarding.ts');
  const habits = suggestHabits({ weeklyFocus: 'learn German consistently', energyPattern: 'low', dailyTimeBudget: '5 min' });
  assert.ok(habits.includes('5 minutes German'));
  assert.ok(habits.length <= 3);

  const modules = recommendModules({ weeklyFocus: 'finish a project and reduce stress', values: ['health', 'career'] });
  assert.ok(modules.includes('projects'));
  assert.ok(modules.includes('health'));
});

test('event log records lightweight local mutation events', async () => {
  const { appendMutationEvent, appendPlannerMemory, getMutationEvents, getPlannerMemory, setStorageUser } = fromRoot('utils/storage.ts');
  setStorageUser('events-user');

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
  const { exportAppBackup, importAppBackup, previewAppBackup, setAppData, setStorageUser } = fromRoot('utils/storage.ts');
  setStorageUser('backup-user');

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
  const { exportAppBackup, getAppData, importAppBackup, previewAppBackup, resetAppData, setAppData, setStorageUser } = fromRoot('utils/storage.ts');
  setStorageUser('restore-user');

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
  assert.equal((await getAppData()).tasks.length, 0);

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
  const { demoData } = fromRoot('data/seed.ts');
  const { generatePlan } = fromRoot('services/planner.ts');

  const plan = await generatePlan(demoData);
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
  const { demoData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');

  const recommendations = getMockRecommendations(demoData, { autonomy: 1, competence: 4, relatedness: 4 });
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
  const { demoData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');
  const { isRelationshipCue } = fromRoot('services/relationshipCue.ts');

  const recommendations = getMockRecommendations(demoData, { autonomy: 4, competence: 4, relatedness: 1 });
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
  const { demoData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');
  const { getNextHourItems, getNextSmallActionItem, getSmallStep, getTodayVisibleRecommendation, isRecommendationForHabit } = fromRoot('services/todayPresentation.ts');

  const habit = demoData.habits[0];
  const habitRecommendation = getMockRecommendations(demoData).find(recommendation => recommendation.type === 'habit_recovery');
  assert.equal(isRecommendationForHabit(habitRecommendation, habit), true);
  assert.equal(getSmallStep(habitRecommendation, habit), 'Do 1 small movement or stretch.');
  assert.equal(getTodayVisibleRecommendation([habitRecommendation], habit), undefined);

  const nextHour = getNextHourItems(demoData.routine, new Date('2026-07-18T06:30:00'));
  assert.ok(nextHour.some(item => item.title === 'German practice'));

  const nextSmallAction = getNextSmallActionItem(demoData.routine, { wake: true, movement: true });
  assert.equal(nextSmallAction.title, 'Shower + prep');
});

test('bulk parser handles bullets and numbered lists', () => {
  const { parseBulkActions } = fromRoot('services/actions.ts');
  assert.deepEqual(parseBulkActions('- Email Sam\n* Prepare slides\n1. Buy groceries\n\n2) Book appointment'), [
    'Email Sam',
    'Prepare slides',
    'Buy groceries',
    'Book appointment'
  ]);
});

test('bulk parser handles comma and semicolon separated items', () => {
  const { parseBulkActions } = fromRoot('services/actions.ts');
  assert.deepEqual(parseBulkActions('Call Robert, review FLOSCOM notes, send email'), [
    'Call Robert',
    'review FLOSCOM notes',
    'send email'
  ]);
  assert.deepEqual(parseBulkActions('1 - German practice; 2. Review paper; • Add Krake notes; Review paper'), [
    'German practice',
    'Review paper',
    'Add Krake notes'
  ]);
});

test('scheduled actions appear only within the next hour', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { createTaskFromInput, getNextHourActions } = fromRoot('services/actions.ts');
  const inside = createTaskFromInput({ title: 'Inside window', scheduledTime: '09:30', durationMinutes: 20 }, 1);
  const outside = createTaskFromInput({ title: 'Outside window', scheduledTime: '11:15', durationMinutes: 20 }, 2);
  const data = { ...defaultData, tasks: [inside, outside], routine: [] };

  const nextHour = getNextHourActions(data, new Date('2026-07-19T09:00:00'));
  assert.equal(nextHour.some(action => action.title === 'Inside window'), true);
  assert.equal(nextHour.some(action => action.title === 'Outside window'), false);
});

test('repeating action creates habit and routine with times per week', () => {
  const { createRepeatingAction } = fromRoot('services/actions.ts');
  const { habit, routine } = createRepeatingAction({ title: 'Stretch', timesPerWeek: 4, daysOfWeek: ['mon', 'wed'], scheduledTime: '07:10', minimum: '2 minutes', moduleId: 'health' }, 10);

  assert.equal(habit.name, 'Stretch');
  assert.equal(habit.minimum, '2 minutes');
  assert.equal(habit.repeat.timesPerWeek, 4);
  assert.deepEqual(habit.repeat.daysOfWeek, ['mon', 'wed']);
  assert.equal(routine.habitId, habit.id);
  assert.equal(routine.scheduledTime, '07:10');
});

test('next small action does not duplicate habit progress item', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { createRepeatingAction, createTaskFromInput, getNextSmallAction } = fromRoot('services/actions.ts');
  const repeating = createRepeatingAction({ title: 'Movement', timesPerWeek: 3, scheduledTime: '09:05', minimum: 'Stretch' }, 20);
  const task = createTaskFromInput({ title: 'Prepare breakfast', scheduledTime: '09:15' }, 21);
  const data = { ...defaultData, habits: [repeating.habit], routine: [repeating.routine], tasks: [task] };

  const next = getNextSmallAction(data, new Date('2026-07-19T09:00:00'), repeating.habit.id);
  assert.equal(next.title, 'Prepare breakfast');
});

test('alignment identifies task matching weekly focus', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { evaluateTodoAlignment } = fromRoot('services/actions.ts');
  const data = {
    ...defaultData,
    preferences: { ...defaultData.preferences, weeklyFocus: 'learn German' },
    characters: [{ ...defaultData.characters[0], desiredPerson: 'A consistent learner', values: ['learning'] }]
  };
  const alignment = evaluateTodoAlignment({ title: 'Study German for 10 minutes', area: 'Learning' }, data);
  assert.equal(alignment.aligned, true);
  assert.equal(alignment.category, 'aligned');
  assert.match(alignment.reason, /aligned/i);
});

test('alignment treats obligations as necessary and never blocks saving', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { createTaskFromInput, evaluateTodoAlignment } = fromRoot('services/actions.ts');
  const task = createTaskFromInput({ title: 'Pay rent', notes: 'Maintenance', priority: 'low' }, 29);
  const alignment = evaluateTodoAlignment(task, defaultData);
  assert.equal(task.status, 'open');
  assert.equal(alignment.aligned, true);
  assert.equal(alignment.category, 'maintenance');
  assert.match(alignment.reason, /Necessary task/);
});

test('alignment suggests parking noncentral tasks gently', () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { evaluateTodoAlignment } = fromRoot('services/actions.ts');
  const data = { ...defaultData, preferences: { ...defaultData.preferences, weeklyFocus: 'reduce stress' } };
  const alignment = evaluateTodoAlignment({ title: 'Research a new hobby gadget', area: 'Personal' }, data);
  assert.equal(alignment.aligned, false);
  assert.equal(alignment.category, 'maybeLater');
  assert.match(alignment.reason, /Not central/);
});

test('user-scoped data remains isolated after action creation', async () => {
  const { defaultData } = fromRoot('data/seed.ts');
  const { createTaskFromInput } = fromRoot('services/actions.ts');
  const { getAppData, setAppData, setStorageUser } = fromRoot('utils/storage.ts');

  setStorageUser('action-user-a');
  await setAppData({ ...defaultData, tasks: [createTaskFromInput({ title: 'Only A' }, 30)] });
  setStorageUser('action-user-b');
  await setAppData({ ...defaultData, tasks: [createTaskFromInput({ title: 'Only B' }, 31)] });

  assert.equal((await getAppData()).tasks[0].title, 'Only B');
  setStorageUser('action-user-a');
  assert.equal((await getAppData()).tasks[0].title, 'Only A');
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
  const { demoData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');
  const { recordRecommendationResponse } = fromRoot('services/plannerMemory.ts');
  const { getMutationEvents, getPlannerMemory, setStorageUser } = fromRoot('utils/storage.ts');
  setStorageUser('recommendation-user');

  const recommendation = getMockRecommendations(demoData)[0];
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
  const { demoData } = fromRoot('data/seed.ts');
  const { getMockRecommendations } = fromRoot('services/os.ts');

  const withoutMemory = getMockRecommendations(demoData);
  const dismissedProjectMemory = Array.from({ length: 3 }, (_, index) => ({
    id: `memory-${index}`,
    createdAt: new Date().toISOString(),
    recommendationId: `old-${index}`,
    recommendationType: 'project_next_action',
    userIntention: 'test',
    suggestedAction: 'test',
    userResponse: 'dismissed'
  }));
  const withMemory = getMockRecommendations(demoData, undefined, dismissedProjectMemory);

  assert.equal(withoutMemory[0].type, 'project_next_action');
  assert.notEqual(withMemory[0].type, 'project_next_action');
});
