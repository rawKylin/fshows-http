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
var util_1 = require("../helpers/util");
var DEFAULT_INFO = {
    AppId: 'fs-logger-default',
    Level: 'INFO',
    Content: ''
};
/**
 * @function: 根据使用场景初始化上报内容基础字段：小程序增加SystemInfo  浏览器平台增加UserAgent字段
 * @author: guoxt
 * @param {IFsLoggerConfig} config
 * @return {*}
 */
function initDefaultInfo(config) {
    var scene = config.scene;
    if (!DEFAULT_INFO.SystemInfo && scene !== 'web') {
        try {
            var info = scene === 'wx' ? wx.getSystemInfoSync() : scene === 'my' ? my.getSystemInfoSync() : {};
            DEFAULT_INFO.SystemInfo = JSON.stringify(info);
        }
        catch (e) {
            throw e;
        }
    }
    if (!DEFAULT_INFO.UserAgent && scene === 'web') {
        DEFAULT_INFO.UserAgent = window.navigator.userAgent;
    }
}
/**
 * @function:
 * @author: guoxt
 * @param {IFsLogger} context
 * @return {*}
 */
function initData(context) {
    var data = context.defaults.data;
    data = typeof data === 'function' ? (0, util_1.getData)(data, context) : data || {};
    return data;
}
var FsLogger = /** @class */ (function () {
    function FsLogger(initConfig) {
        this.defaults = initConfig;
        // 初始化DEFAULT_INFO
        initDefaultInfo(initConfig);
        this.sendInfo = DEFAULT_INFO;
    }
    FsLogger.prototype._logByScene = function (scene, level, content) {
        if (scene === 'wx') {
            return this.wxRequestHttpLog(level, content);
        }
        else if (scene === 'my') {
            return this.myRequestHttpLog(level, content);
        }
        else {
            return this.axiosHttpLog(level, content);
        }
    };
    FsLogger.prototype.log = function (level, content) {
        var scene = this.defaults.scene;
        return this._logByScene(scene, level, content);
    };
    FsLogger.prototype.info = function (content) {
        var scene = this.defaults.scene;
        return this._logByScene(scene, 'info', content);
    };
    FsLogger.prototype.warn = function (content) {
        var scene = this.defaults.scene;
        return this._logByScene(scene, 'warn', content);
    };
    FsLogger.prototype.error = function (content) {
        var scene = this.defaults.scene;
        return this._logByScene(scene, 'error', content);
    };
    FsLogger.prototype.axiosHttpLog = function (level, content) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (content && typeof content !== 'string') {
                content = JSON.stringify(content);
            }
            var data = initData(_this);
            var timestamp = (0, util_1.transitionTimestamp)(new Date().getTime(), 'YYYY-MM-DD HH:MM:SS');
            var sendInfo = __assign(__assign(__assign({}, _this.sendInfo), data), { Level: level ? level.toUpperCase() : 'INFO', Content: content || '', LocalMachineTime: timestamp });
            (0, axios_1.default)({
                url: _this.defaults.url,
                method: 'POST',
                headers: {
                    'content-type': 'application/json;charset=utf-8'
                },
                data: sendInfo,
                timeout: 5000
            })
                .then(function (res) {
                resolve(res);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    FsLogger.prototype.myRequestHttpLog = function (level, content) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (content && typeof content !== 'string') {
                content = JSON.stringify(content);
            }
            var data = initData(_this);
            var timestamp = (0, util_1.transitionTimestamp)(new Date().getTime(), 'YYYY-MM-DD HH:MM:SS');
            var sendInfo = __assign(__assign(__assign({}, _this.sendInfo), data), { Level: level ? level.toUpperCase() : 'INFO', Content: content || '', LocalMachineTime: timestamp });
            my.request({
                headers: {
                    'content-type': 'application/json;charset=utf-8'
                },
                url: _this.defaults.url,
                method: 'POST',
                data: sendInfo,
                timeout: 5000,
                dataType: 'json',
                success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                }
            });
        });
    };
    FsLogger.prototype.wxRequestHttpLog = function (level, content) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (content && typeof content !== 'string') {
                content = JSON.stringify(content);
            }
            var data = initData(_this);
            var timestamp = (0, util_1.transitionTimestamp)(new Date().getTime(), 'YYYY-MM-DD HH:MM:SS');
            var sendInfo = __assign(__assign(__assign({}, _this.sendInfo), data), { Level: level ? level.toUpperCase() : 'INFO', Content: content || '', LocalMachineTime: timestamp });
            wx.request({
                header: {
                    'content-type': 'application/json;charset=utf-8'
                },
                url: _this.defaults.url,
                method: 'POST',
                data: sendInfo,
                timeout: 5000,
                dataType: 'json',
                success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                }
            });
        });
    };
    /**
     * @function: 修改日志上报内容的基本字段
     * @author: guoxt
     * @param {ISendInfo} info
     * @return {*}
     */
    FsLogger.prototype.updateInfo = function (info) {
        this.sendInfo = __assign(__assign({}, this.sendInfo), info);
    };
    return FsLogger;
}());
exports.default = FsLogger;
//# sourceMappingURL=FsLogger.js.map