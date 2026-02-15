import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Chalher2/',   // ⚠️ نفس اسم الريبو ديالك
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
