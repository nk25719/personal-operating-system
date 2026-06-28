import { AppData, Project } from '../types';

export function localSuggestion(data: AppData, prompt: string) {
  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const activeProject = data.projects.find(p => p.status === 'Active');
  return [
    `${active.missionQuestion}`,
    activeProject ? `Suggested next action: ${activeProject.nextAction} (${activeProject.name}).` : 'Suggested next action: choose one active project.',
    `For this task: ${prompt || 'no task entered'}, ask: is it aligned with ${active.values.slice(0, 3).join(', ')}?`,
    'Minimum version: do 10 focused minutes, then decide whether to continue.'
  ].join('\n\n');
}

export async function getAISuggestion(data: AppData, prompt: string) {
  const key = data.integrations.aiApiKey.trim();
  if (!key) return localSuggestion(data, prompt);

  const active = data.characters.find(c => c.id === data.activeCharacterId) ?? data.characters[0];
  const context = {
    identity: active.identity,
    desiredPerson: active.desiredPerson,
    dailyObligations: active.dailyObligations,
    missionQuestion: active.missionQuestion,
    habits: data.habits.map(h => ({ name: h.name, why: h.why })),
    projects: data.projects.map((p: Project) => ({ name: p.name, nextAction: p.nextAction, why: p.why, progress: p.progress }))
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: data.integrations.aiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise personal operating system advisor. Recommend the next best action, useful habits, subtopics, web search terms, role-model/icon research ideas, and a minimum version. Judge recommendations by whether they move the human closer to the person they are trying to become. Do not be preachy.' },
        { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nTask/question: ${prompt}` }
      ]
    })
  });
  const json = await response.json();
  return json?.choices?.[0]?.message?.content ?? localSuggestion(data, prompt);
}
