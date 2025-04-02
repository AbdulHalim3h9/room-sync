import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'; // Import the path module

// https://vite.dev/config/
export default defineConfig({
  // base: '/creditconsumed',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Set the alias to point to the 'src' folder
    },
  },
});