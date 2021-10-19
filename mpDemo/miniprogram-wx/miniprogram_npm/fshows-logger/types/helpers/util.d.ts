import { IFsLogger } from '../types';
/**
 * @function 时间戳转时间
 * @author eleven
 * @param {number} val 传入的时间挫
 * @param {string} type 需要转换的类型  YYYY-MM-DD ： 只需要日期 ； YYYY-MM-DD HH:MM:SS ： 日期加时分秒；YYYY-MM-DD HH:MM:SS ： 日期加时分秒
 * 如只需要如期，则startNum ： 0 ， endNum ： 10
 */
export declare function transitionTimestamp(val: any, type: string): string | undefined;
export declare function getData(data: Function, context: IFsLogger): any;
