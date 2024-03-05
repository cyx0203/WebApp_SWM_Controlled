/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 10:53:03
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-25 14:51:51
 * @FilePath: /vite-project/src/router/AuthRouter.tsx
 * @Description:
 */
// 路由守卫
// 判断token是否存在（如果存在跳转主页，如果不存在跳转登录页面）
import { useEffect } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

// 获取token方法
const getToken = () => {
	// return localStorage.getItem('emp_info')
	return true
}

// 创建一个高阶组件，高阶组件就是 把一个组件当做另一个组件的参数传入 然后通过判断 返回新的组件
// 下面的 AuthRouter 就是一个高阶组件

function AuthRouter({ children }: { children: JSX.Element }) {
	const location = useLocation()
	// 获取token
	const token = getToken()
	const { anything } = useOutletContext<{ anything: string }>()

	useEffect(() => {
		console.log(anything)
		console.log('path', location.pathname)
	}, [])

	// 判断token是否存在 存在直接渲染主页面
	if (token) {
		return <>{children}</>
	} else {
		return <Navigate to={'/login'}></Navigate> //没有token跳转登录页面
	}
}
export { AuthRouter }
