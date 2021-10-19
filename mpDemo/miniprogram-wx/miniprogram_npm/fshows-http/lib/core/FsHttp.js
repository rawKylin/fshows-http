"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var md5_1 = require("md5");
var qs_1 = require("qs");
var REPEAT_REQUEST = 'Repeat request';
var CancelToken = axios_1.default.CancelToken;
var HttpService = /** @class */ (function () {
    function HttpService(signParams) {
        this.signParams = {
            appid: 'MINA-APPID',
            content: '',
            salt: 'LkE8ve8y',
            version: '1.0.0'
        };
        this.axiosTimeout = 10000; // 单位ms
        this.retryTimes = 1;
        this.axios = axios_1.default.create({
            timeout: this.axiosTimeout
        });
        // 用来取消请求
        this.requestCancelMap = {};
        // 请求拦截
        this.requsetInterceptor();
        // 响应拦截
        this.responseInterceptor();
        signParams && this.setSignParams(signParams);
        switch (this.getEnv()) {
            case 'web':
                this.getDataInstance = this.requestAxios;
                break;
            case 'wxapp':
                this.getDataInstance = this.requestWx;
                break;
            case 'alipay':
                this.getDataInstance = this.requestAlipay;
                break;
            default: this.getDataInstance = this.requestAxios;
        }
    }
    // 设置加盐密钥
    HttpService.prototype.setSignParams = function (signParams) {
        this.signParams = signParams;
    };
    HttpService.prototype.setAxiosTimeout = function (axiosTimeout) {
        if (this.getEnv() === 'web') {
            axios_1.default.defaults.timeout = axiosTimeout;
        }
        else {
            console.log('axios 超时时间只在web环境设置');
        }
    };
    /**
     * @func 创建请求
     * @param {object} reqOptions 请求参数
    */
    HttpService.prototype.request = function (reqOptions) {
        var _this = this;
        var reqData = qs_1.default.stringify(this.handleParams(reqOptions.data, reqOptions.url));
        var _a = reqOptions.retryTimes, retryTimes = _a === void 0 ? 1 : _a;
        return new Promise(function (resolve, reject) {
            _this.getData(reqOptions, reqData, retryTimes, resolve, reject);
        });
    };
    /**
     * @func 获取数据
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    HttpService.prototype.getData = function (reqOptions, reqData, retryTimes, resolve, reject) {
        --retryTimes;
        this.retryTimes = retryTimes;
        this.getDataInstance(reqOptions, reqData, retryTimes, resolve, reject);
    };
    /**
     * 获取当前环境
    */
    HttpService.prototype.getEnv = function () {
        // 微信小程序
        if (typeof wx !== 'undefined' && wx.getSystemInfo) {
            return 'wxapp';
        }
        // 支付宝小程序
        if (typeof my !== 'undefined' && my.getSystemInfo) {
            return 'alipay';
        }
        // h5
        if (typeof window !== 'undefined') {
            return 'web';
        }
        return 'Unknown environment';
    };
    /**
     * @func web端请求
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    HttpService.prototype.requestAxios = function (reqOptions, reqData, retryTimes, resolve, reject) {
        var _this = this;
        this.axios.post(reqOptions.baseUrl, reqData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).then(function (response) {
            _this.successFn(response || {}, reqOptions, reqData, retryTimes, resolve, reject);
        }).catch(function (error) {
            _this.errorFn(error, reqOptions, reqData, retryTimes, resolve, reject);
        });
    };
    /**
     * @func 微信小程序端请求
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    HttpService.prototype.requestWx = function (reqOptions, reqData, retryTimes, resolve, reject) {
        var _this = this;
        wx.request({
            url: reqOptions.baseUrl,
            method: reqOptions.method || 'POST',
            data: reqData,
            header: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            success: function (response) {
                _this.successFn(response.data || {}, reqOptions, reqData, retryTimes, resolve, reject);
            },
            fail: function (error) {
                _this.errorFn(error, reqOptions, reqData, retryTimes, resolve, reject);
            }
        });
    };
    /**
     * @func 支付宝小程序端请求
     * @param {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    HttpService.prototype.requestAlipay = function (reqOptions, reqData, retryTimes, resolve, reject) {
        var _this = this;
        my.request({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: reqOptions.method || 'POST',
            data: reqData,
            url: reqOptions.baseUrl,
            dataType: 'json',
            success: function (response) {
                _this.successFn(response.data, reqOptions, reqData, retryTimes, resolve, reject);
            },
            fail: function (error) {
                _this.errorFn(error, reqOptions, reqData, retryTimes, resolve, reject);
            }
        });
    };
    /**
     * @func 请求成功回调函数
     * @param {object} result 返回数据 {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    HttpService.prototype.successFn = function (result, reqOptions, reqData, retryTimes, resolve, reject) {
        if (result.success) {
            resolve(result.data);
            // 成功日志上报
            this.customLoggerHandle && this.customLoggerHandle(result, reqData, reqOptions);
        }
        else {
            if (retryTimes > 0) {
                this.getData(reqOptions, reqData, retryTimes, resolve, reject);
            }
            else {
                if (this.customErrorHandle && typeof this.customErrorHandle === 'function') {
                    this.customErrorHandle(result, reqData, reject);
                }
                reject(result);
            }
        }
    };
    /**
     * @func 请求失败回调函数
     * @param {object} error 错误信息 {object} reqOptions 请求参数 {object} reqData 处理之后的参数, {number} retryTimes 重试次数, {promise.resolve} resolve, {promise.reject} reject
    */
    HttpService.prototype.errorFn = function (error, reqOptions, reqData, retryTimes, resolve, reject) {
        if (retryTimes > 0) {
            this.getData(reqOptions, reqData, retryTimes, resolve, reject);
        }
        else {
            if (this.customErrorHandle && typeof this.customErrorHandle === 'function') {
                this.customErrorHandle(error, reqData, reject);
            }
            reject(error);
        }
    };
    // web端 aixos请求拦截
    HttpService.prototype.requsetInterceptor = function () {
        var _a = this, axios = _a.axios, requestCancelMap = _a.requestCancelMap, retryTimes = _a.retryTimes;
        axios.interceptors.request.use(function (config) {
            // 请求参数字符串，如果是object则强转string
            var requestDataStr = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
            // 将请求url、请求类型、请求参数整合成一个字符串，用它来判断是否是重复请求
            var requestName = config.url + "&" + config.method + "&" + requestDataStr + "&" + retryTimes;
            if (requestName) {
                if (requestCancelMap[requestName] && requestCancelMap[requestName].cancel) {
                    requestCancelMap[requestName].cancel(REPEAT_REQUEST);
                }
                config.cancelToken = new CancelToken(function (cancel) {
                    requestCancelMap[requestName] = {};
                    requestCancelMap[requestName].cancel = cancel;
                });
            }
            return config;
        }, function (error) {
            return Promise.reject(error);
        });
    };
    // web端 axios响应拦截
    HttpService.prototype.responseInterceptor = function () {
        this.axios.interceptors.response.use(function (response) {
            // this.responseLog(response)
            return response.data;
        }, function (error) {
            return Promise.reject(error);
        });
    };
    /**
     * @func 服务端签名
     * @param {object} options 请求参数
     */
    HttpService.prototype.handleParams = function (obj, method) {
        var params = __assign(__assign({}, this.signParams), { method: method });
        params.content = JSON.stringify(obj || {});
        var body = JSON.stringify(params).replace(/\\/g, ''); // 加密的时候需要去掉反斜杠
        params.sign = (0, md5_1.default)(body);
        console.log(params.salt, 'params.salt');
        if (params.salt)
            delete params.salt;
        return params;
    };
    /**
     * @func 打印请求日志
     * @param {object} response 响应对象
     */
    HttpService.prototype.responseLog = function (response) {
        if (process.env.NODE_ENV === 'development') {
            var randomColor = "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ")";
            console.log('%c┍------------------------------------------------------------------┑', "color:" + randomColor + ";");
            console.log('| 请求地址：', response.config.url);
            console.log('| 请求参数：', response.config.data ? qs_1.default.parse(response.config.data) : {});
            console.log('| 返回数据：', response.data);
            console.log('%c┕------------------------------------------------------------------┙', "color:" + randomColor + ";");
        }
    };
    return HttpService;
}());
exports.default = HttpService;
//# sourceMappingURL=FsHttp.js.map