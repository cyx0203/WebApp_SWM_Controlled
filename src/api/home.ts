/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 10:53:03
 * @LastEditors: WangZhuoyi 13317149311@163.com
 * @LastEditTime: 2023-08-04 08:46:31
 * @FilePath: \WebApp2.0\src\api\home.ts
 * @Description:
 */
import axios from 'axios'
import qs from 'querystring'

const URL = {
	TEST: 'https://randomuser.me/api',
}

export function test(params: any) {
	return axios
		.get([URL.TEST, '?', qs.stringify(params)].join(''))
		.then(({ data }) => ({ ...data, total: 200 }))
}
