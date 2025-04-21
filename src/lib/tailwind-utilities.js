import { defineConfig } from 'tailwindcss';

export default defineConfig({
  theme: {
    extend: {
      // Add scrollbar utilities
      scrollbar: {
        hide: {
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      },
    },
  },
  plugins: [],
});
