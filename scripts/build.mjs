import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

// generate config.js from .env
execSync('node scripts/generate-config.mjs', { cwd: root, stdio: 'inherit' });

const filesToCopy = [
  'index.html',
  'styles.css',
  'app.js',
  'config.example.js'
];

for (const file of filesToCopy) {
  const source = join(srcDir, file);
  if (!existsSync(source)) {
    console.warn(`Warning: ${source} not found, skipping`);
    continue;
  }
  cpSync(source, join(distDir, file), { force: true });
}

// copy config.js from src (generated from .env)
cpSync(join(srcDir, 'config.js'), join(distDir, 'config.js'), { force: true });

writeFileSync(join(distDir, '.nojekyll'), '');
