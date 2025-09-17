import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/blockticity/', // Must match your GitHub repo name exactly
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
