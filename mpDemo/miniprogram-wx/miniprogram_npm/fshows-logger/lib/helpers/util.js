"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.transitionTimestamp = void 0;
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
exports.transitionTimestamp = transitionTimestamp;
function getData(data, context) {
    try {
        return data.call(context, context);
    }
    catch (e) {
        return {};
    }
}
exports.getData = getData;
//# sourceMappingURL=util.js.map