import { IFsLoggerConfig, Scene, ISendInfo, LoggerPromise } from '../types';
export default class FsLogger {
    defaults: IFsLoggerConfig;
    sendInfo: ISendInfo;
    constructor(initConfig: IFsLoggerConfig);
    _logByScene(scene: Scene, level: string, content: string | object): LoggerPromise;
    log(level: string, content: string | object): LoggerPromise;
    info(content: string | object): LoggerPromise;
    warn(content: string | object): LoggerPromise;
    error(content: string | object): LoggerPromise;
    axiosHttpLog(level?: string, content?: string | object): LoggerPromise;
    myRequestHttpLog(level?: string, content?: string | object): LoggerPromise;
    wxRequestHttpLog(level?: string, content?: string | object): LoggerPromise;
    /**
     * @function: 修改日志上报内容的基本字段
     * @author: guoxt
     * @param {ISendInfo} info
     * @return {*}
     */
    updateInfo(info: ISendInfo): void;
}
