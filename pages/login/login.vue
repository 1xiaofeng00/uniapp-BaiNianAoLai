<template>
  <view class='login'>

    <swiper vertical='true' style="height: 100vh;">
      <swiper-item>
        <scroll-view>
          <view class='login-tel'>
            <view class='tel-main'>
              <view class='close' @tap="goBack">
                <image class='close-img' src="../../static/close.png" mode=""></image>
              </view>
              <view class='title'>
                <view class="f-active-color">百 年 奥 莱</view>
              </view>
              <view class='tel' @tap="goLoginTel">手机号注册</view>
              <LoginOther></LoginOther>
              <view class='login-go'>
                <view>已有账号，去登录</view>
                <image src="../../static/down.png" mode=""></image>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>

      <swiper-item>
        <scroll-view scroll-y="true">
          <view class='login-tel'>
            <view class='tel-main'>
              <view class='close close-center'>
                <view @tap="goBack">
                  <image class='close-img' src="../../static/close.png" mode=""></image>
                </view>
                <view class='login-go'>
                  <image class='close-img' src="../../static/up.png" mode=""></image>
                  <view>没有账号，去注册</view>
                </view>
                <view></view>
              </view>
              <view class='login-from'>
                <view class='login-user'>
                  <text class='user-text'>账号</text>
                  <input type="text" v-model="userName" value="" placeholder="请输入手机号/昵称" />
                </view>
                <view class='login-user'>
                  <text class='user-text'>密码</text>
                  <input type="password" v-model="userPwd" value="" placeholder="6-16位字符" />
                </view>
              </view>
              <view class='login-quick'>
                <view>忘记密码?</view>
                <view>免密登录</view>
              </view>
              <view class='tel' @tap="submit">登录</view>
              <view class='reminder'>温馨提示：您可以选择免密登录，更加方便</view>
              <LoginOther></LoginOther>
            </view>
          </view>
        </scroll-view>
      </swiper-item>

    </swiper>

  </view>
</template>

<script>
  import $http from "@/common/api/request.js"
  import LoginOther from '@/components/login/login-other.vue'
  import {mapMutations} from "vuex"
  export default {
    data() {
      return {
        //用户输入的内容
        userName: "",
        userPwd: "",
        rules: {
          userName: {
            rule: /\S/,
            msg: "账号不能为空"
          },
          userPwd: {
            rule: /^[0-9a-zA-Z]{6,16}$/,
            msg: "密码应该为6-16位字符"
          }
        }
      }
    },
    components: {
      LoginOther
    },
    methods: {
      ...mapMutations(['login']),
      //手机号注册
      goLoginTel() {
        uni.navigateTo({
          url: "../login-tel/login-tel"
        })
      },
      //关闭当前页面，返回上一页
      goBack() {
        uni.navigateBack({
          delta: 1
        })
      },
      //点击登录
      submit() {
        if (!this.validate('userName')) return;
        if (!this.validate("userPwd")) return;

        uni.showLoading({
          title: "登录中..."
        })

        $http.request({
          url: "/login",
          method: "POST",
          data: {
            userName: this.userName,
            userPwd: this.userPwd
          }
        }).then((res) => {
          if (res.success) {
            //保存用户信息
            this.login(res.data);
            uni.showToast({
              title: res.msg,
              icon: "none"
            })
            uni.hideLoading();
            uni.navigateBack({
              delta: 1
            })
          } else {
            uni.showToast({
              title: res.msg,
              icon: "none"
            })
          }
        }).catch(() => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          })
        })
      },
      //判断验证是否符合要求
      validate(key) {
        let bool = true;
        if (!this.rules[key].rule.test(this[key])) {
          uni.showToast({
            title: this.rules[key].msg,
            icon: "none"
          })
          bool = false;
          return false;
        }
        return bool;
      },
      //进入手机号注册页面
      goLoginTel() {
        uni.navigateTo({
          url: "../login-tel/login-tel"
        })
      }
    }
  }
</script>

<style scoped>
  .login-tel {
    width: 100vw;
    height: 100vh;
  }

  .tel-main {
    padding: 0 20rpx;
  }

  .close {
    padding: 120rpx 0;
  }

  .close-img {
    width: 60rpx;
    height: 60rpx;
  }

  .title {
    font-size: 80rpx;
    text-align: center;
    padding-bottom: 100rpx;
  }

  .tel {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    color: #FFFFFF;
    background-color: #49BDFB;
    border-radius: 40rpx;
  }

  .login-go {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .login-go image {
    width: 60rpx;
    height: 60rpx;
  }

  /*第二*/
  .close-center {
    display: flex;
  }

  .close-center>view {
    flex: 1;
  }

  .login-from {
    padding-top: 100rpx;
  }

  .login-user {
    font-size: 32rpx;
    padding: 10rpx 0;
    display: flex;
    align-items: center;
    border-bottom: 2rpx solid #f7f7f7;
  }

  .user-text {
    padding-right: 10rpx;
  }

  .login-quick {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 0;
  }

  .reminder {
    color: #CCCCCC;
    padding: 20rpx 0;
    text-align: center;
  }
</style>
