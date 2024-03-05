/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 10:53:03
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-25 11:02:46
 * @FilePath: /vite-project/src/router/Root.tsx
 * @Description:
 */
import { Outlet } from 'react-router-dom'

// 根组件，设置整体的layout。上方为NavBar，下方为子路由组件
const Root = () => {
	const anything = '作为上下文传递给所有子组件'

	return (
		<>
			<Outlet context={anything} />
		</>
	)
}
export default Root
