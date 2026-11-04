import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
  react(),
  tailwindcss()
  ],

  // Resolve the '@contract/*' imports (used by src/services/api.ts) at build time.
  // tsconfig.json already maps them for type-checking; this makes Vite resolve them too.
  resolve: {
    alias: {
      '@contract': path.resolve(
        fileURLToPath(new URL('.', import.meta.url)),
        '../cardtalogue-api-contract/gen/ts',
      ),
    },
  },

  server: {
    port: 3000,
  },
})
