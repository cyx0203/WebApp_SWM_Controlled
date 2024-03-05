/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 11:28:49
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-26 09:41:30
 * @FilePath: /WebApp2.0/src/utils/domain.ts
 * @Description:
 */
// import { getConfigFromBroswer } from '@/utils';

// let baseUrl: string = getConfigFromBroswer(['base_url']).base_url;
// console.log(`baseUrl:${baseUrl}`)
export enum Services {
	Basic,
}

export default {
	//基础模块
	[Services.Basic]: '16000',
}
