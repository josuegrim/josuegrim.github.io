import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', 
  server: {
    allowedHosts: true // 👈 ¡ESTA ES LA LLAVE MAESTRA PARA MODO DEV!
  },
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.png']
})