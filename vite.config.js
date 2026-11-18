import { defineConfig } from 'vite';

// GitHub Pages hosts this repository under /laboratoryNO.1/.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/laboratoryNO.1/' : '/',
});
