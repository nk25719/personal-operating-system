import { AppData } from '../types';

export const defaultData: AppData = {
  activeCharacterId: 'nagham',
  characters: [
    {
      id: 'nagham',
      name: 'Nagham',
      identity: 'Biomedical engineer, researcher, builder, learner, and human becoming stronger, freer, and more useful.',
      desiredPerson: 'A strong biomedical engineer who builds useful medical technology, publishes research, serves people, stays healthy, and earns enough freedom to relocate and live independently.',
      dailyObligations: 'Work Monday to Friday 08:00-17:00. Volunteer around 19:00-22:00. Morning routine before 07:45. Weekend gym and pool near parents. Weekly necessities check. Monthly shopping.',
      missionQuestion: 'Does this move this human closer to the person they are trying to become?',
      values: ['Health', 'Engineering mastery', 'Research', 'Service', 'Freedom', 'Relationships'],
      demographics: { biologicalSex: 'female', showWomenHealth: true },
      healthProfile: {
        enabled: false,
        medicalConditions: '',
        allergies: '',
        physicalLimitations: '',
        medications: '',
        pregnancyStatus: 'preferNotToSay',
        sleepIssues: '',
        dietaryPreferences: '',
        mentalHealthConsiderations: '',
        painOrEnergyNotes: '',
        clinicianGuidance: '',
        habitIntensity: 'moderate',
        showHealthDisclaimer: true
      },
      environmentProfile: {
        enabled: true,
        lifePurpose: 'Build a useful, independent, technically strong life through biomedical engineering, research, service, health, and freedom.',
        futureSelfStatement: 'A disciplined biomedical engineer, researcher, builder, and healthy human who chooses environments that strengthen her.',
        integrityDefinition: 'Integrity means my actions, spending, relationships, and commitments match my stated values even when no one is watching.',
        valuesToProtect: ['Health', 'Engineering mastery', 'Research', 'Service', 'Freedom', 'Relationships'],
        desiredEnvironments: 'Engineering labs, research communities, disciplined workspaces, gyms/pools on weekends, quiet reading spaces, people who build and learn.',
        environmentsToAvoid: 'Places or routines that create impulse spending, distraction loops, drama, sleep loss, or distance from long-term goals.',
        desiredPeople: 'Builders, researchers, kind disciplined friends, mentors, engineers, people who encourage health, independence, and serious work.',
        peopleToLimit: 'People who normalize chaos, disrespect, victim mindset, excessive spending, gossip, or pull me away from my core direction.',
        experiencesToSeek: 'Technical workshops, conferences, volunteering with purpose, research collaborations, healthy social outings, language practice, nature and recovery.',
        experiencesToAvoid: 'Outings that drain money, energy, sleep, focus, or self-respect without meaningful connection or recovery.',
        weeklyEnvironmentReview: 'Did my social environment, spaces, and experiences make me more like my future self this week?',
        integrityScoreMode: 'gentle'
      }
    }
  ],
  routine: [
    { id: 'wake', time: '05:30', title: 'Wake up + water', category: 'Body' },
    { id: 'movement', time: '05:35-05:50', title: 'Run / yoga / stretch', category: 'Body' },
    { id: 'shower', time: '05:50-06:20', title: 'Shower + prep', category: 'Body' },
    { id: 'meditation', time: '06:20-06:40', title: 'Heart meditation', category: 'Mind' },
    { id: 'journal', time: '06:40-06:50', title: 'Journal', category: 'Mind' },
    { id: 'german', time: '06:50-07:05', title: 'German practice', category: 'Language' },
    { id: 'breakfast', time: '07:05-07:25', title: 'Breakfast + reading/listening', category: 'Reading' },
    { id: 'reading', time: '07:25-07:45', title: 'Reading', category: 'Reading' },
    { id: 'leave', time: '07:45', title: 'Leave for work', category: 'Work' },
    { id: 'work', time: '08:00-17:00', title: 'Work', category: 'Work' },
    { id: 'technical', time: 'During work', title: 'Technical study block', category: 'Learning' },
    { id: 'dinner', time: '17:30-18:15', title: 'Dinner + rest', category: 'Rest' },
    { id: 'volunteer', time: '19:00-22:00', title: 'Volunteer work', category: 'Service' },
    { id: 'prepare', time: '22:00-22:30', title: 'Prepare tomorrow', category: 'Home' },
    { id: 'sleep', time: '22:30', title: 'Sleep', category: 'Rest' }
  ],
  habits: [
    { id: 'movement', name: 'Movement', frequency: 'Daily', minimum: '10 min stretch', why: 'Energy + discipline', reminderTime: '05:35' },
    { id: 'meditation', name: 'Heart meditation', frequency: 'Daily', minimum: '20 min', why: 'Emotional regulation', reminderTime: '06:20' },
    { id: 'journal', name: 'Journal', frequency: 'Daily', minimum: '5 min', why: 'Self-awareness', reminderTime: '06:40' },
    { id: 'german', name: 'German', frequency: 'Daily', minimum: '15 min', why: 'Relocation path', reminderTime: '06:50' },
    { id: 'reading', name: 'Reading', frequency: 'Daily', minimum: '20 min', why: 'Growth', reminderTime: '07:25' },
    { id: 'technical', name: 'Technical learning', frequency: 'Workdays', minimum: '20 min', why: 'Career mastery' },
    { id: 'paper', name: 'Paper progress', frequency: '3x/week', minimum: '100 words', why: 'Research identity' },
    { id: 'weekly-necessities', name: 'Check necessities', frequency: 'Weekly', minimum: 'One quick check', why: 'Low-maintenance life' },
    { id: 'monthly-shopping', name: 'Monthly shopping', frequency: 'Monthly', minimum: 'One planned trip', why: 'Avoid impulse spending' }
  ],
  projects: [
    { id: 'krake', name: 'Krake', area: 'Engineering', status: 'Active', nextAction: 'Define next technical task', why: 'Patient safety + innovation', progress: 20 },
    { id: 'paper', name: 'Research paper', area: 'Research', status: 'Active', nextAction: 'Write next section', why: 'Publication + credibility', progress: 10 },
    { id: 'german', name: 'German', area: 'Relocation', status: 'Active', nextAction: '15 min daily', why: 'Germany path', progress: 35 },
    { id: 'mastery', name: 'Technical mastery', area: 'Career', status: 'Active', nextAction: 'Study during work', why: 'Biomedical expertise', progress: 15 },
    { id: 'health', name: 'Health system', area: 'Body', status: 'Active', nextAction: 'Weekend gym/pool', why: 'Strength + stability', progress: 25 },
    { id: 'finance', name: 'Personal finance', area: 'Future', status: 'Active', nextAction: 'Review monthly', why: 'Independence', progress: 5 }
  ],
  iconResearch: [
    { id: 'engineer-icon', name: 'Marie Curie', domain: 'Research discipline', whyRelevant: 'Models deep focus, persistence, and contribution to science.', habitsToModel: ['Daily research block', 'Detailed lab notes', 'Long-term patience'], searchQueries: ['Marie Curie daily routine research habits', 'Marie Curie scientific discipline notes'] },
    { id: 'builder-icon', name: 'Limor Fried', domain: 'Engineering maker entrepreneurship', whyRelevant: 'Models engineering, education, open hardware, and building useful products.', habitsToModel: ['Build in public', 'Document projects', 'Teach what you learn'], searchQueries: ['Limor Fried engineering habits Adafruit', 'open hardware founder routine'] },
    { id: 'learning-icon', name: 'Barbara Oakley', domain: 'Learning systems', whyRelevant: 'Models deliberate learning, engineering education, and study systems.', habitsToModel: ['Spaced repetition', 'Focused practice', 'Diffuse mode breaks'], searchQueries: ['Barbara Oakley learning how to learn study habits', 'spaced repetition engineering learning'] }
  ],
  learningTopics: [
    { id: 'networking', name: 'Networking', day: 'Monday', nextAction: 'TCP/IP basics', resources: ['TCP/IP', 'VLAN', 'Wi-Fi basics'] },
    { id: 'dicom', name: 'DICOM', day: 'Tuesday', nextAction: 'DICOM workflow', resources: ['C-STORE', 'Query/Retrieve', 'Modality Worklist'] },
    { id: 'hl7', name: 'HL7 / FHIR', day: 'Wednesday', nextAction: 'HL7 message types', resources: ['ADT', 'ORM', 'ORU', 'FHIR resources'] },
    { id: 'pacs', name: 'PACS / HIS / EMR', day: 'Thursday', nextAction: 'PACS architecture', resources: ['RIS', 'PACS archive', 'Viewer workflow'] },
    { id: 'standards', name: 'ISO / IEC / Risk', day: 'Friday', nextAction: 'ISO 13485 basics', resources: ['ISO 13485', 'ISO 14971', 'IEC 60601'] }
  ],
  lifeProfile: {
    birthDate: '1999-01-01',
    expectedEndDate: '',
    displayMode: 'yearsMonthsDaysHours',
    reminderText: 'Time is not pressure. It is clarity: choose what brings you closer to who you are becoming.'
  },
  womenHealth: {
    enabled: true,
    lastPeriodStart: '',
    averageCycleDays: 28,
    averagePeriodDays: 5,
    pregnancyIntent: 'preferNotToSay',
    fertilityPlanningEnabled: false,
    fertilityReferenceAge: 35,
    fertilityReminderText: 'This is not pressure. It is optional clarity for choices, health conversations, and long-term planning.',
    displayMode: 'yearsMonthsDays',
    notes: ''
  },
  integrations: {
    notionToken: '',
    notionDatabaseId: '',
    aiApiKey: '',
    aiModel: 'gpt-4o-mini',
    calendarName: 'POS',
    webResearchEndpoint: '',
    automationMode: 'assistive'
  },
  modules: [
    { key: 'habits', title: 'Habits', enabled: true, purpose: 'Track repeated practices with one tap.', route: '/habits' },
    { key: 'projects', title: 'Projects', enabled: true, purpose: 'See active outcomes and blockers.', route: '/projects' },
    { key: 'learning', title: 'Learning', enabled: true, purpose: 'Professional learning plan and resources.', route: '/learning' },
    { key: 'decision', title: 'Decision Center', enabled: true, purpose: 'Check purchases, outings, and commitments against identity.', route: '/decision' },
    { key: 'lifeClock', title: 'Life Clock', enabled: false, purpose: 'Optional time-alive and time-left reflection.', route: '/life-clock' },
    { key: 'womenHealth', title: 'Women Health', enabled: true, purpose: 'Optional cycle and family-planning awareness.', route: '/women-health' },
    { key: 'health', title: 'Health Profile', enabled: true, purpose: 'Optional constraints for safer habit suggestions.', route: '/health' },
    { key: 'environment', title: 'Environment & Integrity', enabled: true, purpose: 'Choose social environments and experiences intentionally.', route: '/environment' },
    { key: 'builder', title: 'Identity Builder', enabled: false, purpose: 'Regenerate schedules from a conversational profile.', route: '/builder' },
    { key: 'ai', title: 'AI Advisor', enabled: true, purpose: 'Ask for suggestions when tackling a task.', route: '/ai' }
  ],
  captureInbox: []
};
