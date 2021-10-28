import FsHttp from '../../src/index'
import {ISignConfig, IReqOptions} from '../../src/types'
import Cookies from 'js-cookie'
Cookies.set('token','4eff3d548fd740eab75f3349f983e377')
// import FsLogger from 'fshows-logger'

const signParams: ISignConfig = { 
  appid: 'MINA-APPID',
  content: '',
  salt: 'xxxxxxxx', // 加盐 加密完之后需要从params删除
  version: '1.0.0'
}
const fsHttp = new FsHttp(signParams)
const fsHttp2 = new FsHttp()
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
const reqOptions2: IReqOptions = {
  data:{
    customerId: "78hhdsjdsh",
    receiptId: "202109221412023121669592227",
  },
  url: "browse/keyword/fshows-http",
  baseUrl:'api/',
  method: 'POST',
  sendRawData: true,
  formatType: 'json',
  retryTimes:3,
}

fsHttp.setSignParams(signParams)
fsHttp.setAxiosTimeout(5000)
fsHttp2.setAxiosTimeout(5000)
fsHttp2.setTokenName('token')
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
  console.log(reqOptions2,'reqOptions2');
  
  fsHttp2.request(reqOptions2).then(res=>{
    console.log(res,'sssssss');
    
    resultEl.innerHTML = JSON.stringify(res)
  }).catch(err=>{
    resultEl.innerHTML = err.errorMsg
  })
})