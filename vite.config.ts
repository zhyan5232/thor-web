import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// 引入 Iconify 插件
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),
    // 组件自动按需引入
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
        // 自动解析 Iconify 图标组件
        IconsResolver({
          prefix: 'icon', // 图标前缀
        }),
      ],
    }),
    // Iconify 插件配置
    Icons({
      autoInstall: true, // 自动安装缺失的图库
      compiler: 'vue3',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/thor': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})