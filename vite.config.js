import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8000'),
    'import.meta.env.VITE_API_EXTERNAL_BASE_URL': JSON.stringify(process.env.VITE_API_EXTERNAL_BASE_URL || 'http://localhost:8000'),
    'import.meta.env.VITE_ADMINISTRATOR_EMAIL_ADDRESS': JSON.stringify(process.env.VITE_ADMINISTRATOR_EMAIL_ADDRESS || 'widodo@codingcollective.com'),
    'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(process.env.VITE_RECAPTCHA_SITE_KEY || '6LeI-RYtAAAAADMDlTey9S1lDhfxT1Z14o1IUqEE')
  }
})
