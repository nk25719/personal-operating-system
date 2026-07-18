import { AppData } from '../types';
import { getSecret } from '../utils/secrets';

export async function syncProjectsToNotion(data: AppData) {
  const token = await getSecret('notionToken');
  const databaseId = data.integrations.notionDatabaseId.trim();
  if (!token || !databaseId) return 'Add Notion token and database ID in Settings first.';

  let count = 0;
  for (const project of data.projects) {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: project.name } }] },
          Area: { rich_text: [{ text: { content: project.area } }] },
          Status: { select: { name: project.status } },
          Progress: { number: project.progress },
          Why: { rich_text: [{ text: { content: project.why } }] },
          'Next Action': { rich_text: [{ text: { content: project.nextAction } }] }
        }
      })
    });
    if (res.ok) count += 1;
  }
  return `Synced ${count}/${data.projects.length} projects to Notion.`;
}
