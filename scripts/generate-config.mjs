import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const envPath = join(root, '.env');
const outPath = join(root, 'src', 'config.js');

if (!existsSync(envPath)) {
  const examplePath = join(root, 'src', 'config.example.js');
  if (!existsSync(examplePath)) {
    console.error('.env and config.example.js not found');
    process.exit(1);
  }
  console.log('.env not found – creating config.js from config.example.js');
  const example = readFileSync(examplePath, 'utf-8');
  writeFileSync(outPath, example);
  process.exit(0);
}

const envRaw = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envRaw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
}

const url = env.SUPABASE_URL || '';
const key = env.SUPABASE_ANON_KEY || '';

const content = `window.APP_CONFIG = {
  supabaseUrl: '${url}',
  supabaseAnonKey: '${key}'
};
`;

writeFileSync(outPath, content);
console.log('config.js generated from .env');
