export interface IReqOptions {
    baseUrl: string;
    url: string;
    method?: "POST" | "GET" | undefined;
    data?: any;
    specialError?: boolean;
    retryTimes?: number;
    isMockData?: boolean;
    hasToast?: boolean;
}
export interface ISignConfig {
    appid?: string;
    content?: string;
    salt?: string;
    sign?: string;
    version?: string;
}
