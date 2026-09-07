import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': '/src/components',
      '@ui': '/src/components/ui',
      '@pages': '/src/pages',
      '@styles': '/src/styles',
      '@utils': '/src/utils',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        nosotros: 'nosotros.html',
        admin: 'src/pages/admin/admin.html',
        login: 'src/pages/login/login.html',
      },
    },
  },
});