import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    // Expose on the local network so a phone can reach it.
    host: true,
    // Serve over HTTPS so getUserMedia works outside of localhost.
    https: true,
  },
})
