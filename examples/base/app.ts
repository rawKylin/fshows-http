import FsHttp from '../../src/index'
import {ISignConfig, IReqOptions} from '../../src/types'
// import FsLogger from 'fshows-logger'

const signParams: ISignConfig = { 
  appid: 'MINA-APPID',
  content: '',
  salt: 'xxxxxxxx', // 加盐 加密完之后需要从params删除
  version: '1.0.0'
}
const signParams2: ISignConfig = { 
  appid: 'MINA-APPID',
  content: '',
  salt: 'yyyyyy', // 加盐 加密完之后需要从params删除
  version: '1.0.0'
}
const fsHttp = new FsHttp(signParams)
const fsHttp2 = new FsHttp(signParams2)
const reqOptions: IReqOptions = {
  data:{
    customerId: "78hhdsjdsh",
    receiptId: "202109221412023121669592227",
  },
  url: "receipt.minaapp.receipt.home",
  baseUrl:'https://lifecircle-minagw-test.51youdian.com/gateway',
  method: 'POST',
  retryTimes:3,
}
fsHttp.setSignParams(signParams)
fsHttp.setAxiosTimeout(5000)
fsHttp2.setSignParams(signParams2)
fsHttp2.setAxiosTimeout(5000)
fsHttp.customErrorHandle = (result, reqData, reqOptions)=>{
  console.log('没事跑个错误')
  
}
/**
 * result 接口返回结果
 * reqData 处理之后的请求信息
 * reqOptions 原始请求信息
*/
fsHttp.customSuccessHandle = (result,reqData, reqOptions)=>{
  console.log('自定义成功函数，可在此处上报日志函数');
}

const btnEl = document.getElementById('btn')
const resultEl = document.getElementById('result')
btnEl!.addEventListener('click', e => {
  fsHttp.request(reqOptions).then(res=>{
    resultEl.innerHTML = JSON.stringify(res)
  }).catch(err=>{
    resultEl.innerHTML = err.errorMsg
  })
  // fsHttp2.request(reqOptions).then(res=>{
  //   resultEl.innerHTML = JSON.stringify(res)
  // }).catch(err=>{
  //   resultEl.innerHTML = err.errorMsg
  // })
})