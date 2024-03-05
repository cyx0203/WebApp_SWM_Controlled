/*
 * @Author: WangZhuoYi
 * @Date: 2023-06-25 19:45:17
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-25 17:13:50
 * @FilePath: /WebApp2.0/src/router/ErrorPage.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Result } from 'antd'

export default function ErrorPage() {
	const navigate = useNavigate()
	const [restTime, setRestTime] = useState(3)

	useEffect(() => {
		setTimeout(() => {
			if (restTime === 0) {
				navigate('/')
				// window.parent.location.href = '/login'
			} else {
				setRestTime(restTime - 1)
			}
		}, 1000)
	})

	return (
		<div id="error-page">
			<Result
				status="404"
				title="404"
				subTitle="抱歉, 您访问的页面不存在。"
				extra={<p>页面将在 {restTime} 秒后跳转至首页</p>}
			/>
		</div>
	)
}
