import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  build: {
    commonjsOptions: {
      include: [/firebase/, /node_modules/],
    },
  },
}); 