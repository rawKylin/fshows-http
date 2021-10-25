import Axios, { AxiosInstance, AxiosResponse, AxiosError, Canceler } from 'axios'
import md5 from 'md5'
import Cookies from 'js-cookie'
import qs from 'qs'
import { ISignConfig, IReqOptions } from '../types'

const REPEAT_REQUEST = 'Repeat request'
const CancelToken = Axios.CancelToken

class HttpService {
  // axios请求实例
  public axios: AxiosInstance | undefined
  public requestCancelMap: AnyObject
  public signParams: ISignConfig = {
    appid: 'MINA-APPID',
    content: '',
    salt: 'xxxxxx', // 加盐 加密完之后需要从params删除
    version: '1.0.0'
  }

  public axiosTimeout: number = 10000 // 单位ms
  public getDataInstance: Function
  public cookieTokenName: string = 'token' // 存放在cookies中的token参数名称

  /**
   * @func 用户自定义错误处理函数
   * @param {any} err 错误信息 {object} reqData 处理后的请求参数, {object} reqOptions 请求参数
   * */

  public customErrorHandle: Function | undefined

  // 用户自定义日志上报函数
  public customSuccessHandle: Function | undefined

  public retryTimes = 1

  constructor(signParams: ISignConfig | undefined) {
    // 用来取消请求 web端
    this.requestCancelMap = {}
    // 设置签名参数
    signParams && this.setSignParams(signParams)
    // 设置请求数据实例
    switch (this.getEnv()) {
      case 'web':
        this.initAxios()
        this.getDataInstance = this.requestAxios
        break
      case 'wxapp':
        this.getDataInstance = this.requestWx
        break
      case 'alipay':
        this.getDataInstance = this.requestAlipay
        break
      default:
        this.getDataInstance = this.requestAxios
    }
  }

  // 设置加盐密钥
  setSignParams(signParams: ISignConfig) {
    this.signParams = signParams
  }
  initAxios() {
    this.axios = Axios.create({
      timeout: this.axiosTimeout
    })

    // 请求拦截
    this.requsetInterceptor()
    // 响应拦截
    this.responseInterceptor()
  }
  setTokenName(cookieTokenName: string) {
    this.cookieTokenName = cookieTokenName
  }
  setAxiosTimeout(axiosTimeout: number) {
    if (this.getEnv() === 'web') {
      Axios.defaults.timeout = axiosTimeout
    } else {
      console.log('axios 超时时间只在web环境设置')
    }
  }
  /**
   * @func 创建请求
   * @param {object} reqOptions 请求参数
   */

  request(reqOptions: IReqOptions): Promise<any> {
    const reqObj = this.handleParams(
      reqOptions.data,
      reqOptions.url,
      reqOptions.sendRawData,
      reqOptions.formatType
    )

    const reqData = reqObj.data
    const headers = reqObj.headers
    const { retryTimes = 1 } = reqOptions
    let url = reqOptions.baseUrl
    if (reqOptions.sendRawData) {
      url += reqOptions.url
    }

    return new Promise((resolve, reject) => {
      this.getData(reqOptions, reqData, retryTimes, resolve, reject, headers, url)
    })
  }
  /**
   * @func 获取数据
   * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
   */

  getData(
    reqOptions: object,
    reqData: any,
    retryTimes: number,
    resolve: any,
    reject: any,
    headers: any,
    url: string
  ) {
    --retryTimes
    this.retryTimes = retryTimes
    this.getDataInstance(reqOptions, reqData, retryTimes, resolve, reject, headers, url)
  }
  /**
   * 获取当前环境
   */
  getEnv() {
    // 微信小程序
    if (typeof wx !== 'undefined' && wx.getSystemInfo) {
      return 'wxapp'
    }
    // 支付宝小程序
    if (typeof my !== 'undefined' && my.getSystemInfo) {
      return 'alipay'
    }
    // h5
    if (typeof window !== 'undefined') {
      return 'web'
    }
    return 'Unknown environment'
  }
  /**
   * @func web端请求
   * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
   */

  requestAxios(
    reqOptions: IReqOptions,
    reqData: any,
    retryTimes: number,
    resolve: any,
    reject: any,
    headers: any,
    url: string
  ) {
    let axiosInstance
    if (reqOptions.method === 'GET') {
      // axiosInstance =(this.axios as AxiosInstance).get(`${url}?${typeof reqData === 'string' ? reqData : qs.stringify(reqData)  }`)
      axiosInstance = (this.axios as AxiosInstance).get(url, { params: reqOptions.data })
      console.log(reqData, 'reqData')
    } else {
      axiosInstance = (this.axios as AxiosInstance).post(url, reqData, {
        headers
      })
    }
    axiosInstance
      .then((response: AxiosResponse) => {
        this.successFn(
          response || {},
          reqOptions,
          reqData,
          retryTimes,
          resolve,
          reject,
          headers,
          url
        )
      })
      .catch((error: AxiosError) => {
        this.errorFn(error, reqOptions, reqData, retryTimes, resolve, reject, headers, url)
      })
  }
  /**
   * @func 微信小程序端请求
   * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
   */

  requestWx(
    reqOptions: IReqOptions,
    reqData: any,
    retryTimes: number,
    resolve: any,
    reject: any,
    header: any,
    url: string
  ) {
    wx.request({
      url,
      method: reqOptions.method || 'POST',
      data: reqData,
      header,
      success: (response: any) => {
        this.successFn(
          response.data || {},
          reqOptions,
          reqData,
          retryTimes,
          resolve,
          reject,
          header,
          url
        )
      },
      fail: (error: any) => {
        this.errorFn(error, reqOptions, reqData, retryTimes, resolve, reject, header, url)
      }
    })
  }
  /**
   * @func 支付宝小程序端请求
   * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
   */

  requestAlipay(
    reqOptions: IReqOptions,
    reqData: any,
    retryTimes: number,
    resolve: any,
    reject: any,
    headers: any,
    url: string
  ) {
    my.request({
      headers,
      method: reqOptions.method || 'POST',
      data: reqData,
      url,
      dataType: 'json',
      success: (response: any) => {
        this.successFn(
          response.data,
          reqOptions,
          reqData,
          retryTimes,
          resolve,
          reject,
          headers,
          url
        )
      },
      fail: (error: any) => {
        this.errorFn(error, reqOptions, reqData, retryTimes, resolve, reject, headers, url)
      }
    })
  }
  /**
   * @func 请求成功回调函数
   * @param {object} result 返回数据 {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
   */

  successFn(
    result: any,
    reqOptions: IReqOptions,
    reqData: any,
    retryTimes: number,
    resolve: any,
    reject: any,
    headers: any,
    url: string
  ) {
    if (result.success) {
      this.hideLoading(reqOptions.hasToast)
      resolve(result.data)
      // 成功日志上报
      this.customSuccessHandle && this.customSuccessHandle(result, reqData, reqOptions)
    } else {
      if (retryTimes > 0) {
        this.getData(reqOptions, reqData, retryTimes, resolve, reject, headers, url)
      } else {
        if (this.customErrorHandle && typeof this.customErrorHandle === 'function') {
          this.customErrorHandle(result, reqData, reqOptions)
        }
        this.hideLoading(reqOptions.hasToast)
        reject(result)
      }
    }
  }
  /**
   * @func 请求失败回调函数
   * @param {object} error 错误信息 {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
   */

  errorFn(
    error: any,
    reqOptions: IReqOptions,
    reqData: any,
    retryTimes: number,
    resolve: any,
    reject: any,
    headers: any,
    url: string
  ) {
    if (retryTimes > 0) {
      this.getData(reqOptions, reqData, retryTimes, resolve, reject, headers, url)
    } else {
      if (this.customErrorHandle && typeof this.customErrorHandle === 'function') {
        this.customErrorHandle(error, reqData, reqOptions)
      }
      this.hideLoading(reqOptions.hasToast)
      reject(error)
    }
  }
  hideLoading(hasToast: boolean | undefined) {
    if (hasToast) {
      let _env = this.getEnv()
      if (_env === 'wxapp') {
        wx.hideLoading()
      } else if (_env === 'alipay') {
        my.hideLoading()
      }
    }
  }

  // web端 aixos请求拦截
  requsetInterceptor() {
    const { requestCancelMap, retryTimes, cookieTokenName } = this
    ;(this.axios as AxiosInstance).interceptors.request.use(
      (config: any) => {
        // 请求参数字符串，如果是object则强转string
        const requestDataStr =
          typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
        // 将请求url、请求类型、请求参数整合成一个字符串，用它来判断是否是重复请求
        const requestName = `${config.url}&${config.method}&${requestDataStr}&${retryTimes}`
        if (requestName) {
          if (requestCancelMap[requestName] && requestCancelMap[requestName].cancel) {
            requestCancelMap[requestName].cancel(REPEAT_REQUEST)
          }
          config.cancelToken = new CancelToken((cancel: Canceler) => {
            requestCancelMap[requestName] = {}
            requestCancelMap[requestName].cancel = cancel
          })
        }
        if (Cookies.get(cookieTokenName)) {
          config.headers.Authorization = Cookies.get(cookieTokenName)
        }

        return config
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )
  }
  // web端 axios响应拦截
  responseInterceptor() {
    ;(this.axios as AxiosInstance).interceptors.response.use(
      response => {
        // this.responseLog(response)
        return response.data
      },
      error => {
        return Promise.reject(error)
      }
    )
  }

  /**
   * @func 服务端签名
   * @param {object} options 请求参数
   */
  handleParams(
    obj: AnyObject,
    method: string,
    sendRawData: boolean | undefined,
    formatType: string | undefined
  ) {
    console.log(obj, method, sendRawData, 'sendRawData', formatType)

    let data = {}
    let headers = {}
    if (sendRawData) {
      switch (formatType) {
        case 'json':
          headers = {
            'Content-Type': 'application/json;charset=UTF-8'
          }
          data = obj
          break
        case 'formdata': {
          const formData = new FormData()
          Object.keys(obj).forEach(key => {
            if (key === 'files') {
              obj[key].forEach((i: any) => {
                formData.append('files', i)
              })
            } else if (obj[key] != null) {
              formData.append(key, obj[key])
            }
          })
          headers = { 'Content-type': 'multipart/formdata;charset=UTF-8' }
          data = formData
          break
        }
        case 'qs':
          headers = { 'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
          data = qs.stringify(obj)
          break
        case 'form-urlencoded':
        default:
          headers = { 'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
          data = obj
          break
      }
    } else {
      const params = { ...this.signParams, method }
      params.content = JSON.stringify(obj || {})
      const body = JSON.stringify(params).replace(/\\/g, '') // 加密的时候需要去掉反斜杠
      params.sign = md5(body)
      if (params.salt) delete params.salt
      data = qs.stringify(params)
      headers = { 'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    }

    return {
      data,
      headers
    }
  }

  /**
   * @func 打印请求日志
   * @param {object} response 响应对象
   */
  responseLog(response: AxiosResponse) {
    if (process.env.NODE_ENV === 'development') {
      const randomColor = `rgba(${Math.round(Math.random() * 255)},${Math.round(
        Math.random() * 255
      )},${Math.round(Math.random() * 255)})`
      console.log(
        '%c┍------------------------------------------------------------------┑',
        `color:${randomColor};`
      )
      console.log('| 请求地址：', response.config.url)
      console.log('| 请求参数：', response.config.data ? qs.parse(response.config.data) : {})
      console.log('| 返回数据：', response.data)
      console.log(
        '%c┕------------------------------------------------------------------┙',
        `color:${randomColor};`
      )
    }
  }
}

export default HttpService
