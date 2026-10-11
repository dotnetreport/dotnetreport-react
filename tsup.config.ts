import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  loader: { '.html': 'text' },
  define: { __ENGINE_VERSION__: JSON.stringify(pkg.version) },
  external: ['react', 'react-dom'],
  banner: { js: '"use client";' },
});
