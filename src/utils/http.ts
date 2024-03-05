/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-06-26 14:54:53
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-28 14:41:24
 * @FilePath: /WebApp2.0/src/utils/http.ts
 * @Description: axios封装模块
 */
import axios, { AxiosHeaders } from 'axios'
// import cookie from 'js-cookie'
import { message } from 'antd'
import qs from 'querystring'
import domain from './domain'
import type { Services } from './domain'



import { eq, pick, pipe, prop } from 'lodash/fp';

const isSeat = pipe(prop('vtm_type'), eq('01'));

/**
 * 从定制浏览器中获取配置参数
 * @param props 需要获取的参数项
 * @param namespace 命名空间，默认为 VTM配置
 * @returns
 *
 * @example
 *
 * const config = getConfigFromBroswer(['term_id', 'demo_name']);
 * // 如果不存在某条配置，该条配置的返回值默认为空字符串！
 * // {
 * //    term_id: '',
 * //    demo_name: ''
 * // }
 */
export const getConfigFromBroswer: (
  props: string[],
  namespace?: string,
) => Record<string, string> = (props, namespace = 'VTM配置') => {
  if (window.z?.config) {
    // 额外做一次校验，非坐席（01）直接置空；
    const res = pick(props, window.z.config[namespace]);
    if (props.includes('term_id') && !isSeat(window.z.config.VTM配置)) {
      res.term_id = '';
    }
    return res;
  } else {
    return props.reduce((acc, cur) => ({ ...acc, [cur]: '' }), {});
  }
};

const timestamp = Date.now();
// import { getConfigFromBroswer } from "./index"
let baseUrl: string = getConfigFromBroswer(['base_url']).base_url;
//创建默认实列
const instance = axios.create({
	baseURL: baseUrl,
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json',
	},
})

//拦截器
instance.interceptors.request.use(
	config => {
		// 处理cookie
		// if (cookie.get('token')) {
		// 	//把获取cookie值放到header里面
		// 	config.headers['token'] = cookie.get('token')
		// }
		config.transformRequest = [
			// 对请求参数的统一格式处理

			// data => {
			// 	return {
			// 		header: {
			// 			timestamp: 1234567,
			// 		},
			// 		body: {
			// 			...data,
			// 		},
			// 		sign: 'GEIT_NOT_SIGN',
			// 	}
			// },
			data => {
				return JSON.stringify(data)
			},
		]
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

instance.interceptors.response.use(response => {
	// 对返回参数的统一格式处理
	const { data } = response
	// console.log(data)
	// if (data.header.returnCode !== '0') {
	// 	message.error('交易失败')
	// 	return Promise.reject(response)
	// }
	return data
})

const Trade = {
	get(
		apiUrl: string,
		params: any,
		headers?: AxiosHeaders
	) {
		return instance({
			method: 'GET',
			url: `${apiUrl}?${qs.stringify(params)}`,
			headers,
		})
	},
	post(
		apiUrl: string,
		data: any,
		headers?: AxiosHeaders
	) {
		return instance({
			method: 'POST',
			url: `${apiUrl}`,
			data:{
				header: {
					timestamp,
				  },
				body: data,
			},
			headers,
		})
	},
}

//暴露实例出去
export default Trade
