import { defineConfig } from 'vitest/config';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  test: {
    include: ['apps/*/test/*.test.ts', 'packages/*/test/*.test.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
  },
  plugins: [
    {
      name: 'resolve-ts-imports',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) return null;

        const dir = path.dirname(importer);
        const cleanSource = source.replace(/\.js$/, '');
        const candidate = path.resolve(dir, cleanSource + '.ts');

        if (fs.existsSync(candidate)) {
          return candidate;
        }

        const indexCandidate = path.resolve(dir, cleanSource, 'index.ts');
        if (fs.existsSync(indexCandidate)) {
          return indexCandidate;
        }

        return null;
      },
    },
  ],
});
