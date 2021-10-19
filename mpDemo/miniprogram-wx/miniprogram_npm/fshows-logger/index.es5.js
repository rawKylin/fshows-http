import axios from 'axios';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/**
 * @function 时间戳转时间
 * @author eleven
 * @param {number} val 传入的时间挫
 * @param {string} type 需要转换的类型  YYYY-MM-DD ： 只需要日期 ； YYYY-MM-DD HH:MM:SS ： 日期加时分秒；YYYY-MM-DD HH:MM:SS ： 日期加时分秒
 * 如只需要如期，则startNum ： 0 ， endNum ： 10
 */
function transitionTimestamp(val, type) {
    val = val.length < 13 ? val * 1000 : val * 1; // 当不是毫秒时候，转换为毫秒
    var date = new Date(val);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hour = ("0" + date.getHours() * 1).slice(-2);
    var minute = ("0" + date.getMinutes() * 1).slice(-2);
    var second = ("0" + date.getSeconds() * 1).slice(-2);
    var millisecond = ("00" + date.getMilliseconds() * 1).slice(-3);
    switch (type) {
        case 'YYYY-MM-DD':
            return year + '-' + month + '-' + day;
        case 'YYYY-MM-DD HH:MM:SS':
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        case 'YYYY-MM-DD HH:MM':
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        case 'HH:MM:SS':
            return hour + ':' + minute + ':' + second;
        case 'YYYY-MM-DD HH:MM:SS':
            return (year +
                '-' +
                month +
                '-' +
                day +
                ' ' +
                hour +
                ':' +
                minute +
                ':' +
                second +
                ',' +
                millisecond);
        case 'MM-DD HH:MM':
            return month + '-' + day + ' ' + hour + ':' + minute;
    }
}
function getData(data, context) {
    try {
        return data.call(context, context);
    }
    catch (e) {
        return {};
    }
}

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
    data = typeof data === 'function' ? getData(data, context) : data || {};
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
            var timestamp = transitionTimestamp(new Date().getTime(), 'YYYY-MM-DD HH:MM:SS');
            var sendInfo = __assign(__assign(__assign({}, _this.sendInfo), data), { Level: level ? level.toUpperCase() : 'INFO', Content: content || '', LocalMachineTime: timestamp });
            axios({
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
            var timestamp = transitionTimestamp(new Date().getTime(), 'YYYY-MM-DD HH:MM:SS');
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
            var timestamp = transitionTimestamp(new Date().getTime(), 'YYYY-MM-DD HH:MM:SS');
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

export { FsLogger as default };
//# sourceMappingURL=index.es5.js.map
