import { defineConfig } from 'vite';
export default defineConfig({
  build: { rollupOptions: { output: {
    // Three remains lazy: only world.js imports this shared engine chunk.
    manualChunks(id) { if(id.includes('node_modules/three/')) return 'three'; },
  } } },
});
