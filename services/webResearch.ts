import { AppData } from '../types';

export async function getDeepResearchSuggestions(data: AppData, subject: string) {
  const endpoint = data.integrations.webResearchEndpoint?.trim();
  if (!endpoint) {
    return [
      `Research ${subject} biography daily routine`,
      `${subject} habits interviews advice`,
      `${subject} recommended books talks lectures`,
      `${subject} field subtopics beginner roadmap`,
      `${subject} skills checklist practical projects`
    ];
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject })
  });
  const json = await response.json();
  return Array.isArray(json?.suggestions) ? json.suggestions : [];
}
