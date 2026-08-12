// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    optimizeDeps: {
      include: ['@rive-app/react-webgl2', '@rive-app/webgl2'],
    },
    ssr: {
      noExternal: ['@rive-app/react-webgl2'],
    },
  },
  base: "/ui/"
});
