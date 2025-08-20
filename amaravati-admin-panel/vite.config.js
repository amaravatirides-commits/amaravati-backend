import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Add the file extensions you want Vite to process for JSX
      include: '**/*.jsx,**/*.js',
    })
  ],
  server: {
    port: 3000
  }
});