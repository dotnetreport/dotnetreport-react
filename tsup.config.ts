import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
// The client library versions the main app (and the dotnetreport npm package) use
const mainApp = JSON.parse(readFileSync('../package.json', 'utf8').replace(/^﻿/, ''));
const libVersions = Object.fromEntries(Object.entries(mainApp.dependencies as Record<string, string>).map(([k, v]) => [k, v.replace(/^[\^~]/, '')]));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  loader: { '.html': 'text' },
  define: {
    __ENGINE_VERSION__: JSON.stringify(pkg.version),
    __LIB_VERSIONS__: JSON.stringify(libVersions),
  },
  external: ['react', 'react-dom'],
  banner: { js: '"use client";' },
});
