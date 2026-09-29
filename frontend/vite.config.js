import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const frontendRoot = fileURLToPath(new URL('./', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  root: frontendRoot,
  server: {
    fs: { allow: [workspaceRoot] },
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: {
    emptyOutDir: true,
    outDir: '../dist',
  },
});
