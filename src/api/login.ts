/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 10:53:03
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-25 13:27:10
 * @FilePath: /vite-project/src/api/login.ts
 * @Description:
 */
import { Trade, Services } from '@/utils'

const URL = {
	LOGIN: '/xxx/login',
}

export function login(params: any) {
	return Trade.post(Services.Basic, URL.LOGIN, params)
}
