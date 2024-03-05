/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-06-21 16:31:06
 * @LastEditors: WangZhuoyi 13317149311@163.com
 * @LastEditTime: 2023-10-23 10:38:19
 * @FilePath: \WebApp2.0\src\main.tsx
 * @Description: 入口文件基本配置模块
 */
import ReactDOM from 'react-dom/client'
import React, { Suspense } from 'react'
import './styles/index.less'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'antd/locale/zh_CN'
import 'tailwindcss/tailwind.css'

dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// <React.StrictMode>
		<ConfigProvider
			locale={zhCN}
			componentSize="middle"
			theme={{
				token: {
					colorPrimary: '#0e4da0',
				},
			}}
		>
			<Suspense fallback={'...loading'}>
				<RouterProvider router={router} />
			</Suspense>
		</ConfigProvider>
	// </React.StrictMode>
)
