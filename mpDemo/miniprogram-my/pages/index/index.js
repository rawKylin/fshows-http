import FsHttp from 'fshows-http'
const fsHttp = new FsHttp()
fsHttp.setSignParams({
  appid: 'java-test',
  content: '',
  salt: 'zzzz', // 加盐 加密完之后需要从params删除
  version: '1.0.0'
})
Page({
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  getData () {
    fsHttpwx.request({
      data:{"storeId":95011991,"customerId":"xxxxxxxxx","qrcode":"2ecf5e2599804f4788d6b0643e53d53f","page":1,"pageSize":8,"accessToken":"ea788c04a53049859269cbb1dec5da16","templateProgram":2,"minaPlatform":1,"uid":"3209834"},
      url: "com.fshows.lifecircle.look.around",
      baseUrl:'https://lifecircle-minagw-test.51youdian.com/mobile/gateway',
      method: 'POST',
      retryTimes:3,
      hasToast: true
    }).then(res=>{
      console.log(res,'res');
    }).catch(err=>{
      console.log(err,'err');
    })
  }
});
