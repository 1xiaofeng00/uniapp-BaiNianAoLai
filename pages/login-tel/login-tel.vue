<template>
  <view>
    <Lines></Lines>
    <view class='login-tel'>
      <view class='tel-main'>
        <view class='login-from'>
          <view class='login-user'>
            <text class='user-text'>手机号</text>
            <input type="number" focus='true' v-model="userTel" value="" placeholder="请输入11位手机号" />
          </view>
        </view>
        <view class='tel' @tap='goNextCode'>下一步</view>
      </view>
    </view>
  </view>
</template>

<script>
  import $http from "@/common/api/request.js"
  import Lines from '@/components/common/line.vue'
  export default {
    data() {
      return {
        userTel: '',
        //验证的规格
        rules: {
          userTel: {
            rule: /^1[3456789]\d{9}$/,
            msg: "请输入11位手机号"
          }
        }
      }
    },
    components: {
      Lines
    },
    methods: {
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
      goNextCode() {
        //先判断是否符合要求
       if (!this.validate('userTel')) return;
       //在进行手机号的验证码发送
        $http.request({
          url: "/registered",
          method: "POST",
          data: {
            phone: this.userTel,
          }
        }).then((res) => {
          if (!res.success) {
            uni.showToast({
              title: res.msg,
              icon: "none"
            })
            return;
          }else{
            uni.navigateTo({
              url: "../login-code/login-code?phone="+this.userTel+""
            })
          }
        }).catch(() => {
          uni.showToast({
            title: '登录失败',
            icon: 'none'
          })
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

  .login-from {
    padding: 30rpx 0;
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

  .tel {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    color: #FFFFFF;
    background-color: #49BDFB;
    border-radius: 40rpx;
  }
</style>
