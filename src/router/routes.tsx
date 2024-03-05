/*
 * @Author: WangZhuoYi
 * @Date: 2023-06-25 12:30:28
 * @LastEditors: WangZhuoyi 13317149311@163.com
 * @LastEditTime: 2023-09-14 14:59:58
 * @FilePath: \WebApp2.0\src\router\routes.tsx
 * @Description:
 *
 */
import { Navigate, NonIndexRouteObject } from 'react-router-dom'
import Root from './Root'
import ErrorPage from './ErrorPage'

export interface IRoute extends NonIndexRouteObject {
	title?: string
	name?: string
	children?: IRoute[]
}

const routes: IRoute[] = [
	{
		path: '/',
		element: <Root />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Navigate to="/browser"></Navigate>, // 重定向到首页
				title: '404',
			},
			{
				path: '/browser',
				name: '自助',
			}
		],
	},
]

export default routes
