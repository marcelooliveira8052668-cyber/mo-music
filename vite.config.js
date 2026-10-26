import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Eu uso caminhos relativos para o site funcionar tanto no domínio
  // raiz quanto no GitHub Pages (github.io/mo-music/).
  base: './',
  plugins: [react()],
  resolve: {
    alias: command === 'build' ? [{
      find: './arquivosLocais',
      replacement: fileURLToPath(new URL('./src/dados/arquivosLocais.publico.js', import.meta.url)),
    }] : [],
  },
}))
