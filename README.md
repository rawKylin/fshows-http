# fsRequest 请求工具

## 使用

### 安装

```bash
npm install fshows-http --save
```

### demo

```javascript
import FsHttp from 'fshows-http'
const fsHttp1 = new FsHttp({
  appid: 'java-test',
  content: '',
  salt: 'xxxxxxx', // 加盐 加密完之后需要从params删除
  version: '1.0.0'
})
// 也可以创建实例后 设置签名参数
const fsHttp2 = new FsHttp()
fsHttp2.setSignParams({
  appid: 'java-test',
  content: '',
  salt: 'yyyyy', // 加盐 加密完之后需要从params删除
  version: '1.0.0'
})

// 自定义成功函数 通用
fsHttp1.customSuccessHandle = (result, reqData, reqOptionst) => {
  console.log('可以在此，上报日志')
}
// 自定义失败函数 通用
fsHttp.customErrorHandle = (result, reqData, reject) => {
  console.log('没事跑个错误')
  reject({
    errorMsg: '自定义抛错'
  })
}

// 请求函数
fsHttp1
  .request({
    data: {
      storeId: 95011991,
      customerId: 'xxxxxxxxx',
      qrcode: '2ecf5e2599804f4788d6b0643e53d53f',
      page: 1,
      pageSize: 8,
      accessToken: 'ea788c04a53049859269cbb1dec5da16',
      templateProgram: 2,
      minaPlatform: 1,
      uid: '3209834'
    },
    url: 'com.fshows.lifecircle.look.around',
    baseUrl: 'https://lifecircle-minagw-test.51youdian.com/mobile/gateway',
    method: 'POST',
    retryTimes: 3,
    hasToast: true
  })
  .then(res => {})
  .catch(err => {})
```

## 配置项

- 签名参数 signParams（）

  - appid 应用 ID string 类型
  - content 内容 string 类型
  - salt 盐 string 类型
  - version 版本 string 类型

- 请求参数 reqOptions

  - baseUrl 基础 url 地址 必传
  - url 接口地址 必传
  - method 请求方式 'POST'|'GET'|undefined 非必传
  - data 请求数据
  - retryTimes 请求次数，当接口异常时自动重新请求 非必传 默认值为 1
  - hasToast 是否有 toast 微信/支付宝小程序环境有效 接口返回值后 若 hasToast 为 true 关闭 toast 弹窗

## 方法
