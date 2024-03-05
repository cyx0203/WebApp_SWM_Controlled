
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	publicDir: path.resolve(__dirname, 'public'),
	plugins: [
		react(),
		// 适配IE浏览器加上
		// legacy({
		// 	targets: ['defaults', 'not IE 11'],
		// }),
	],
	resolve: {
		//配置
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	build: {
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		},
		rollupOptions: {
			output: {
				chunkFileNames: 'static/js/[name]-[hash].js',
				entryFileNames: 'static/js/[name]-[hash].js',
				assetFileNames: ({ name }) => {
					if (name.endsWith('css')) {
						return 'static/css/[name]-[hash].css'
					}
					return 'assets/[name]-[hash].[ext]'
				},
				manualChunks(id) {
					//静态资源分拆打包
					if (id.includes('node_modules')) {
						if (id.includes('.pnpm')) {
							return id
								.toString()
								.split('node_modules/.pnpm')[1]
								.split('/')[0]
								.toString()
						}
						return id
							.toString()
							.split('node_modules/')[1]
							.split('/')[0]
							.toString()
					}
				},
			},
		},
	},
})
