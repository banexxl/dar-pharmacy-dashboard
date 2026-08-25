import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env');
const outputPath = resolve(rootDir, '.env.example');

const envContent = readFileSync(envPath, 'utf-8');

const exampleContent = envContent
     .split('\n')
     .map((line) => {
          const trimmed = line.trim();

          // Keep empty lines, comments, and section headers as-is
          if (!trimmed || trimmed.startsWith('#')) {
               return line;
          }

          // Match KEY=VALUE (strip the value)
          const eqIndex = line.indexOf('=');
          if (eqIndex === -1) {
               return line;
          }

          const key = line.slice(0, eqIndex);
          return `${key}=`;
     })
     .join('\n');

writeFileSync(outputPath, exampleContent, 'utf-8');

console.log(`Generated .env.example with ${exampleContent.split('\n').filter((l) => l.includes('=')).length} variables.`);
