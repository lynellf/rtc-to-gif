import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), crossOriginIsolation()]
})
