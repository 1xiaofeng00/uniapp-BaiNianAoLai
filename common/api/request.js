import store from '@/store/index.js'
export default {
  common: {
    baseUrl: "http://192.168.xx.xx:3000/api",
    header: {
      //JSON序列化
      'content-type': "application/json",
      //将数据转换为 query string
      'content-type': "application/x-www-form-urlencoded"
    },
    method: "GET",
    dataType: "json"
  },
  request(options = {}) {
    // uni.showLoading({
    // 	title: '加载中'
    // });
    options.url = this.common.baseUrl + options.url;
    options.data = options.data || this.common.data;
    options.header = options.header || this.common.header;
    options.method = options.method || this.common.method;
    options.dataType = options.dataType || this.common.dataType;
    
    //判断是否传入了header头的token进行用户是否登陆的验证
    if(options.header.token){
       options.header.token = store.state.user.token;
         if(!options.header.token){
             uni.showToast({
               title:"请先登录",
               icon:"none"
             })
             return uni.navigateTo({
               url:"/pages/login/login"
             })
         }
  }
    
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success: (result) => {
          if (result.statusCode != 200) {
            return reject()
          }
          let data = result.data.data;
          resolve(data)
        }
      })
    })
  }
}
