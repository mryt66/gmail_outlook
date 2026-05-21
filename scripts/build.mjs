import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const distDir = join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

// generate config.js from .env
execSync('node scripts/generate-config.mjs', { cwd: root, stdio: 'inherit' });

const filesToCopy = [
  'index.html',
  'styles.css',
  'app.js',
  'config.js',
  'config.example.js'
];

for (const file of filesToCopy) {
  const source = join(root, file);
  if (!existsSync(source)) {
    continue;
  }
  cpSync(source, join(distDir, file), { force: true });
}

writeFileSync(join(distDir, '.nojekyll'), '');
