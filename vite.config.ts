import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'], gsap: ['gsap', 'lenis'] },
      },
    },
  },
  server: { port: 4331 },
});
