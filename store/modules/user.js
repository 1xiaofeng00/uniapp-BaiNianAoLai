export default{
  state:{
    //登陆状态
    loginStatus:false,
    //token
    token:null,
    //用户信息(昵称/头像)
    userInfo:{}
    
  },
  getters:{},
  mutations:{
    //一旦进入了app，就需要执行这个方法，把用户的信息读出来
    initUser(state){
      let userInfo=uni.getStorageSync('userInfo');
      if(userInfo){
        userInfo=JSON.parse(userInfo);
        state.userInfo=userInfo;
        state.loginStatus=true;
        state.token=userInfo.token
      }
    },
    
    //登陆后保存用户信息
    login(state,userInfo){
      state.userInfo=userInfo;
      state.loginStatus=true;
      state.token=userInfo.token
      //持久化存储  对象转换为字符串
      uni.setStorageSync('userInfo',JSON.stringify(userInfo))
    },
    //退出登录
    loginOut(state){
      state.loginStatus=false;
      state.userInfo={};
      state.token=null
      //删除本地存储的信息
      uni.removeStorageSync('userInfo')
    }
  },
  actions:{}
}