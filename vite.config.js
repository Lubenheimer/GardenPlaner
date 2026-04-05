import { defineConfig } from 'vite';

// Beim Build für GitHub Pages den Repo-Namen als base-Pfad setzen.
// Lokal (npm run dev) bleibt base auf '/' — kein Unterschied für den Dev-Server.
const isGHPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGHPages ? '/GardenPlaner/' : '/',
  server: {
    port: 5173,
    proxy: {
      // Alle /api-Anfragen werden an den lokalen Express-Server weitergeleitet
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
