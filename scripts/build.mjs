import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

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
