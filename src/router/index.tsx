/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-06-21 14:24:31
 * @LastEditors: WangZhuoyi 13317149311@163.com
 * @LastEditTime: 2023-08-09 09:26:16
 * @FilePath: \WebApp2.0\src\router\index.tsx
 * @Description: 路由模块
 */
import { createHashRouter } from 'react-router-dom'
import routes, { IRoute } from './routes'
import { AuthRouter } from './AuthRouter'
import React, { ComponentType, lazy } from 'react'

// 获取所有页面，否则动态导入报错
const modules = import.meta.glob<{ default: ComponentType<any> }>(
	'@/pages/**/index.tsx'
)

// 由于react-router本身没有路由守卫一说，需要自己在路由外封装一层，而整个路由是嵌套关系，所以需要递归调用
const router = createHashRouter(wrapWithAuth(routes))

function wrapWithAuth(routes: IRoute[]) {
	return routes.map(route => {
		if (route.path !== '/') {
			const LazyComponent = lazy(modules[`/src/pages${route.path}/index.tsx`])
			route.element = <LazyComponent />
		}
		if (route.title) {
			route.loader = async () => {
				return { title: route.title }
			}
		}
		if (route.path === '/login') {
			return route
		}
		if (route.children) {
			route.children = wrapWithAuth(route.children as IRoute[])
		} else {
			route.element = (
				<AuthRouter>{route.element as React.ReactElement}</AuthRouter>
			)
		}
		return route
	})
}

export default router
