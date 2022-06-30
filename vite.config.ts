import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsConfigPath from 'vite-tsconfig-paths'
import vitePluginImp from 'vite-plugin-imp'

const port = 3121 // TODO: need xalpha services to allow nitrox port=4000

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port,
    strictPort: true,
    open: true,
  },
  base: './',
  plugins: [
    react(),
    tsConfigPath(),
    vitePluginImp({
      optimize: true,
      libList: [
        {
          libName: 'antd',
          libDirectory: 'es',
          style: name => `antd/es/${name}/style`,
        },
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})
