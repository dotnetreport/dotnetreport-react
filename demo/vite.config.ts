import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));
const mainApp = path.resolve(here, '../..');
const mainPkg = JSON.parse(fs.readFileSync(path.join(mainApp, 'package.json'), 'utf8').replace(/^﻿/, ''));
const libVersions = Object.fromEntries(Object.entries(mainPkg.dependencies as Record<string, string>).map(([k, v]) => [k, v.replace(/^[\^~]/, '')]));
const pkg = JSON.parse(fs.readFileSync(path.join(here, '../package.json'), 'utf8'));

const types: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif' };

// Serves /vendor/<package>@<version>/<file> like jsDelivr, from the main app: its own Scripts and Content
// for dotnetreport, so the demo runs the current code, and its node_modules for the client libraries
function vendor(): Plugin {
  return {
    name: 'dotnetreport-vendor',
    configureServer(server) {
      server.middlewares.use('/vendor/', (req, res, next) => {
        const m = /^\/((?:@[^/]+\/)?[^/@]+)@[^/]+\/([^?]*)/.exec(req.url || '');
        if (!m) return next();
        const [, name, file] = m;
        const local = name === 'dotnetreport'
          ? path.join(mainApp, file.endsWith('.css') ? 'Content' : 'Scripts', path.basename(file))
          : path.join(mainApp, 'node_modules', name, file);
        if (!fs.existsSync(local)) { res.statusCode = 404; return res.end(); }
        res.setHeader('Content-Type', types[path.extname(local)] || 'application/octet-stream');
        fs.createReadStream(local).pipe(res);
      });
    },
  };
}

const api = { target: 'https://localhost:52107', changeOrigin: true, secure: false };

export default defineConfig({
  root: here,
  plugins: [react(), vendor()],
  define: {
    __ENGINE_VERSION__: JSON.stringify(pkg.version),
    __LIB_VERSIONS__: JSON.stringify(libVersions),
  },
  server: {
    port: 5173,
    proxy: { '/api': api, '/DotNetReport': api },
  },
});
