/*
 * @Description: 接口/类型声明
 * @version:
 * @Author: roland
 * @Date: 2021-10-19 14:57:55
 * @LastEditors: guoxt
 * @LastEditTime: 2021-08-29 14:17:39
 */
export interface IReqOptions {
  // 请求参数格式
  baseUrl: string
  url: string
  method?: 'POST' | 'GET' | undefined
  data?: any
  specialError?: boolean
  retryTimes?: number
  isMockData?: boolean
  hasToast?: boolean
  formatType?: string
  sendRawData?: boolean
}

export interface ISignConfig {
  //加盐密钥格式
  appid?: string
  content?: string
  salt?: string // 加盐 加密完之后需要从params删除
  sign?: string
  version?: string
}
