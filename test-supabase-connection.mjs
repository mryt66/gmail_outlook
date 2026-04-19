import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function getConfig() {
  const configPath = join(process.cwd(), 'config.js');
  const raw = readFileSync(configPath, 'utf8');

  const urlMatch = raw.match(/supabaseUrl:\s*'([^']+)'/);
  const keyMatch = raw.match(/supabaseAnonKey:\s*'([^']+)'/);

  if (!urlMatch || !keyMatch) {
    throw new Error('Nie udalo sie odczytac supabaseUrl lub supabaseAnonKey z config.js');
  }

  return {
    supabaseUrl: urlMatch[1],
    supabaseAnonKey: keyMatch[1]
  };
}

async function main() {
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  const endpoint = `${supabaseUrl}/rest/v1/survey_responses?select=id&limit=1`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json'
    }
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('TEST_FAIL');
    console.error(`status=${response.status}`);
    console.error(`body=${text}`);
    process.exit(1);
  }

  console.log('TEST_OK');
  console.log(`status=${response.status}`);
  console.log(`body=${text}`);
}

main().catch((error) => {
  console.error('TEST_ERROR');
  console.error(error.message);
  process.exit(1);
});
