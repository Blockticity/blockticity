import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/blockticity-coa-viewer/', // 👈 Must match your GitHub repo name
  plugins: [vue()],
});
