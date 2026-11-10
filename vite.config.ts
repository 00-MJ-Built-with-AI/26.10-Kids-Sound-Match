import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { ksmPlugin } from './tools/vite-plugin-ksm.ts';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

/** The commit being built: Vercel says, else git; empty when neither knows. */
function gitInfo(): { commit: string; message: string } {
  const run = (cmd: string) => {
    try {
      return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      return '';
    }
  };
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || run('git rev-parse HEAD');
  const message = process.env.VERCEL_GIT_COMMIT_MESSAGE || run('git log -1 --format=%s');
  return { commit: commit.slice(0, 7), message: message.split('\n')[0].slice(0, 120) };
}
const git = gitInfo();

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Placeholders (emoji pictures, tones, device speech) exist in development and test builds only.
  // A release build (`npm run build`) never contains them; tools/check-release.mjs enforces that.
  const allowPlaceholders = command === 'serve' || mode === 'test';
  const builtAt = new Date().toISOString();
  return {
    base: './',
    plugins: [react(), ksmPlugin({
        allowPlaceholders,
        telemetryUrl: env.VITE_TELEMETRY_URL ?? '',
        supabaseUrl: env.VITE_SUPABASE_URL ?? '',
        build: { time: builtAt, commit: git.commit, message: git.message },
      })],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      // Shown on Home, so the parent can tell which update is open.
      __BUILD_TIME__: JSON.stringify(builtAt),
      __BUILD_COMMIT__: JSON.stringify(git.commit),
      __BUILD_MESSAGE__: JSON.stringify(git.message),
      __ALLOW_PLACEHOLDERS__: JSON.stringify(allowPlaceholders),
    },
    build: {
      // Keep bundled code out of /assets, which holds the content packs.
      assetsDir: 'app',
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      // Recordings saved by the studio must not reload the page mid-session (the plugin serves them).
      watch: { ignored: ['**/public/assets/**/*.wav', '**/dev-assets/replaced/**'] },
    },
    preview: { host: true, port: 4173, strictPort: true },
    test: {
      include: ['src/**/*.test.ts'],
      environment: 'node',
    },
  };
});
