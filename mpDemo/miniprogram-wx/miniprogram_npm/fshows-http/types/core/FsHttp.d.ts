import { AxiosInstance, AxiosResponse } from 'axios';
import { ISignConfig, IReqOptions } from '../types';
declare class HttpService {
    axios: AxiosInstance;
    requestCancelMap: AnyObject;
    signParams: ISignConfig;
    axiosTimeout: number;
    getDataInstance: Function;
    customErrorHandle: Function | undefined;
    customLoggerHandle: Function | undefined;
    retryTimes: number;
    constructor(signParams: ISignConfig | undefined);
    setSignParams(signParams: ISignConfig): void;
    setAxiosTimeout(axiosTimeout: number): void;
    /**
     * @func 创建请求
     * @param {object} reqOptions 请求参数
    */
    request(reqOptions: IReqOptions): Promise<any>;
    /**
     * @func 获取数据
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    getData(reqOptions: object, reqData: any, retryTimes: number, resolve: any, reject: any): void;
    /**
     * 获取当前环境
    */
    getEnv(): "wxapp" | "alipay" | "web" | "Unknown environment";
    /**
     * @func web端请求
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    requestAxios(reqOptions: IReqOptions, reqData: any, retryTimes: number, resolve: any, reject: any): void;
    /**
     * @func 微信小程序端请求
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    requestWx(reqOptions: IReqOptions, reqData: any, retryTimes: number, resolve: any, reject: any): void;
    /**
     * @func 支付宝小程序端请求
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    requestAlipay(reqOptions: IReqOptions, reqData: any, retryTimes: number, resolve: any, reject: any): void;
    /**
     * @func 请求成功回调函数
     * @param {object} result 返回数据 {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    successFn(result: any, reqOptions: IReqOptions, reqData: any, retryTimes: number, resolve: any, reject: any): void;
    /**
     * @func 请求失败回调函数
     * @param {object} error 错误信息 {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    errorFn(error: any, reqOptions: IReqOptions, reqData: any, retryTimes: number, resolve: any, reject: any): void;
    requsetInterceptor(): void;
    responseInterceptor(): void;
    /**
     * @func 服务端签名
     * @param {object} options 请求参数
     */
    handleParams(obj: AnyObject, method: string): {
        method: string;
        appid?: string | undefined;
        content?: string | undefined;
        salt?: string | undefined;
        sign?: string | undefined;
        version?: string | undefined;
    };
    /**
     * @func 打印请求日志
     * @param {object} response 响应对象
     */
    responseLog(response: AxiosResponse): void;
}
export default HttpService;
