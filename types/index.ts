export type TonePreference = 'warm' | 'gentle' | 'direct' | 'practical' | 'reflective' | 'coach' | 'minimal' | 'structured';

export type UserPreferences = {
  preferredName?: string;
  username?: string;
  tone: TonePreference;
  preferredTone?: TonePreference;
  rotatingPrompts: string[];
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  currentSeason?: string;
  weeklyFocus?: string;
  energyPattern?: 'low' | 'mixed' | 'good';
  dailyTimeBudget?: '5 min' | '15 min' | '30 min' | 'flexible';
  recommendedModules?: ModuleKey[];
};

export type UserProfile = {
  authUserId?: string;
  email?: string | null;
  username?: string;
  displayName?: string;
  pronouns?: string;
};

export type Character = {
  id: string;
  name: string;
  identity: string;
  desiredPerson?: string;
  dailyObligations?: string;
  missionQuestion: string;
  values: string[];
  demographics?: Demographics;
  healthProfile?: HealthProfile;
  environmentProfile?: EnvironmentProfile;
};

export type RoutineItem = {
  id: string;
  time: string;
  title: string;
  category: 'Body' | 'Mind' | 'Language' | 'Reading' | 'Work' | 'Service' | 'Home' | 'Learning' | 'Rest';
  notes?: string;
  type?: 'todo' | 'scheduled' | 'routine' | 'habit';
  moduleId?: ModuleKey;
  projectId?: string;
  habitId?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  repeat?: ActionRepeat;
  priority?: ActionPriority;
  status?: ActionStatus;
  createdAt?: string;
  completedAt?: string;
};

export type Habit = {
  id: string;
  title?: string;
  name: string;
  frequency: string;
  minimum: string;
  why: string;
  reminderTime?: string;
  notes?: string;
  type?: 'habit';
  moduleId?: ModuleKey;
  projectId?: string;
  habitId?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  repeat?: ActionRepeat;
  priority?: ActionPriority;
  status?: ActionStatus;
  createdAt?: string;
  completedAt?: string;
  isVisibleToOthers?: boolean;
  visibleTo?: string[];
};

export type ActionRepeat = {
  frequency: 'none' | 'daily' | 'weekly';
  daysOfWeek?: DayOfWeek[];
  timesPerWeek?: number;
};

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ActionPriority = 'low' | 'medium' | 'high';
export type ActionStatus = 'open' | 'done' | 'skipped';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  type?: 'todo' | 'scheduled' | 'routine' | 'habit';
  moduleId?: ModuleKey;
  area: 'Personal' | 'Work' | 'Project' | 'Learning' | 'Health' | 'Home' | 'Service';
  status: 'Todo' | 'Doing' | 'Done' | ActionStatus;
  priority: 'Low' | 'Medium' | 'High' | ActionPriority;
  dueDate?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  repeat?: ActionRepeat;
  habitId?: string;
  createdAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  projectId?: string;
  alignmentNote?: string;
};

export type RecommendationAction = {
  id: 'accept' | 'modify' | 'dismiss' | 'snooze';
  label: string;
};

export type Recommendation = {
  id: string;
  type: 'schedule_adjustment' | 'habit_recovery' | 'reflection_prompt' | 'knowledge_resurfacing' | 'relationship_checkin' | 'project_next_action';
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
  confidence: number;
  assumptions: string[];
  knowledgeLimits: string[];
  actions: RecommendationAction[];
};

export type MotivationNeed = 'autonomy' | 'competence' | 'relatedness';

export type MotivationCheckIn = {
  autonomy: number;
  competence: number;
  relatedness: number;
  note?: string;
};

export type MutationEventType =
  | 'habit.completed'
  | 'task.created'
  | 'task.bulk_created'
  | 'routine.created'
  | 'habit.created'
  | 'capture.saved'
  | 'agency.updated'
  | 'recommendation.accepted'
  | 'recommendation.modified'
  | 'recommendation.dismissed'
  | 'recommendation.snoozed'
  | 'connection.done'
  | 'connection.skipped'
  | 'data.updated'
  | 'character.updated'
  | 'backup.imported';

export type MutationEvent = {
  id: string;
  type: MutationEventType;
  createdAt: string;
  payload?: Record<string, unknown>;
};

export type PlannerMemoryResponse = 'accepted' | 'modified' | 'dismissed' | 'snoozed';
export type PlannerMemoryResult = 'helped' | 'neutral' | 'notHelpful';

export type PlannerMemoryRecord = {
  id: string;
  createdAt: string;
  recommendationId: string;
  recommendationType?: Recommendation['type'];
  userIntention: string;
  suggestedAction: string;
  userResponse: PlannerMemoryResponse;
  resultLater?: PlannerMemoryResult;
};

export type Project = {
  id: string;
  name: string;
  area: string;
  status: 'Active' | 'Paused' | 'Done';
  nextAction: string;
  why: string;
  progress: number;
};

export type LearningTopic = {
  id: string;
  name: string;
  day: string;
  nextAction: string;
  resources: string[];
};

export type IconResearchItem = {
  id: string;
  name: string;
  domain: string;
  whyRelevant: string;
  habitsToModel: string[];
  searchQueries: string[];
};

export type Demographics = {
  biologicalSex?: 'female' | 'male' | 'other' | 'preferNotToSay';
  showWomenHealth?: boolean;
};

export type HealthProfile = {
  enabled: boolean;
  medicalConditions: string;
  allergies: string;
  physicalLimitations: string;
  medications: string;
  pregnancyStatus?: 'notPregnant' | 'pregnant' | 'postpartum' | 'trying' | 'preferNotToSay';
  sleepIssues: string;
  dietaryPreferences: string;
  mentalHealthConsiderations: string;
  painOrEnergyNotes: string;
  clinicianGuidance: string;
  habitIntensity: 'gentle' | 'moderate' | 'ambitious';
  showHealthDisclaimer: boolean;
};

export type EnvironmentProfile = {
  enabled: boolean;
  lifePurpose: string;
  futureSelfStatement: string;
  integrityDefinition: string;
  valuesToProtect: string[];
  desiredEnvironments: string;
  environmentsToAvoid: string;
  desiredPeople: string;
  peopleToLimit: string;
  experiencesToSeek: string;
  experiencesToAvoid: string;
  weeklyEnvironmentReview: string;
  integrityScoreMode: 'gentle' | 'strict';
};

export type WomenHealthProfile = {
  enabled: boolean;
  lastPeriodStart?: string;
  averageCycleDays: number;
  averagePeriodDays: number;
  pregnancyIntent?: 'notNow' | 'maybeLater' | 'trying' | 'preferNotToSay';
  fertilityPlanningEnabled: boolean;
  fertilityReferenceAge: number;
  fertilityReminderText: string;
  displayMode: 'days' | 'monthsDays' | 'yearsMonthsDays';
  notes?: string;
};

export type LifeProfile = {
  birthDate?: string;
  expectedEndDate?: string;
  displayMode: 'hours' | 'daysHours' | 'monthsDaysHours' | 'yearsMonthsDaysHours';
  reminderText: string;
};

export type IntegrationSettings = {
  notionDatabaseId: string;
  aiModel: string;
  calendarName: string;
  webResearchEndpoint?: string;
  automationMode?: 'manual' | 'assistive' | 'automatic';
};

export type ModuleKey =
  | 'habits'
  | 'projects'
  | 'learning'
  | 'decision'
  | 'lifeClock'
  | 'womenHealth'
  | 'health'
  | 'environment'
  | 'builder'
  | 'ai';

export type ModuleConfig = {
  key: ModuleKey;
  title: string;
  enabled: boolean;
  purpose: string;
  route: string;
};

export type CaptureEntry = {
  id: string;
  createdAt: string;
  text: string;
  extractedActions: string[];
  suggestedModule?: ModuleKey;
};

export type ConnectedAccount = {
  id: string;
  provider: 'gmail';
  email: string;
  connectedAt: string;
  visible: boolean;
};

export type FriendConnection = {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted';
  sharedHabits: string[];
};

export type AppData = {
  userProfile?: UserProfile;
  activeCharacterId: string;
  characters: Character[];
  routine: RoutineItem[];
  habits: Habit[];
  projects: Project[];
  tasks: Task[];
  learningTopics: LearningTopic[];
  iconResearch: IconResearchItem[];
  lifeProfile: LifeProfile;
  womenHealth: WomenHealthProfile;
  preferences: UserPreferences;
  integrations: IntegrationSettings;
  modules: ModuleConfig[];
  captureInbox: CaptureEntry[];
  connectedAccounts: ConnectedAccount[];
  friends: FriendConnection[];
};
