<template>
  <view class="confirm-order bg-active-color">
    <Lines></Lines>

    <!-- 地址 -->
    <view class="order-map" @tap="goPathList">
      <template v-if="path">
        <view class="order-title">
          <view class="map-name">收件人：{{path.name}}</view>
          <view>{{path.tel}}</view>
        </view>
        <view>
          收货地址:{{path.city}}{{path.details}}
        </view>
      </template>
      <template v-else>
        <view class="address">请选择收货地址</view>
      </template>
    </view>
    <!--商品-->
    <view class='goods-list'>

      <view class='goods-content bg-active-color' v-if="item" v-for="(item,index) in goodsList" :key="index">
        <image class='goods-img' :src="item.imgUrl" mode=""></image>
        <view class='goods-text'>
          <view class='goods-name'>{{item.name}}</view>
          <view class='goods-size f-color'>颜色分类：黑色</view>
          <view class='f-active-color' style='font-size:24rpx'>7天无理由</view>
        </view>
        <view>
          <view>¥{{item.pprice}}</view>
          <view class='f-color'>*{{item.num}}</view>
        </view>
      </view>

    </view>
    <!--底部 : 提交订单-->
    <view class='order-foot'>
      <view class='total-price'>合计：<text class='f-active-color'>¥{{totalCount.pprice}}</text></view>
      <view class="confirm" @tap="goPayment">提交订单</view>
    </view>

  </view>
</template>

<script>
  import $http from "@/common/api/request.js"
  import Lines from "@/components/common/line.vue"
  import {
    mapGetters,
    mapState,
    mapMutations
  } from "vuex"
  export default {
    data() {
      return {
        path: false,
      }
    },
    computed: {
      ...mapState({
        list: state => state.cart.list,
        orderNumber:state=>state.order.orderNumber,
        selectedList:state=>state.cart.selectedList
      }),
      ...mapGetters(["defaultPath", "totalCount"]),
      //根据商品列表找到对应的e.detail 数据的 id  最终返回商品数据
      goodsList() {
        return this.item.map(id => {
          return this.list.find(v => v.id == id);
        })
      }
    },
    onLoad(e) {
      //选中的商品id的集合
      this.item = JSON.parse(e.detail);
      //如果有默认地址的赋值
      $http.request({
        url: "/selectAddress",
        method: "POST",
        header: {
          token: true
        }
      }).then((res) => {
        this.__initAddressList(res);
        if (this.defaultPath.length) {
          this.path = this.defaultPath[0];
        }
      }).catch(() => {
        uni.showToast({
          title: '请求失败',
          icon: 'none'
        })
      })


      //如果触发自定义事件，$on接收
      uni.$on("selectPathItem", (res) => {
        this.path = res
      })
    },
    onUnload() {
      uni.$off("selectPathItem", () => {
        console.log('移除');
      })
    },
    components: {
      Lines
    },
    methods: {
      ...mapMutations(['__initAddressList']),
      // 跳转确认支付页面
      goPayment() {
        if (!this.path) {
          return uni.showToast({
            title: "请选择收货地址",
            icon: "none"
          })
        }
        
        $http.request({
          url: "/submitOrder",
          method: "POST",
          header: {
            token: true
          },
          data:{
            orderId:this.orderNumber,
            shopArr:this.selectedList
          },
        }).then((res) => {
         if(res.success){
           //跳转到支付页面
           uni.navigateTo({
             url: "../payment/payment?details="+JSON.stringify({
               price:this.totalCount.pprice
             })
           })
         }
        }).catch(() => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          })
        })
         
      },
      //跳转地址管理页面
      goPathList() {
        uni.navigateTo({
          url: "../my-path-list/my-path-list?type=selectedPath"
        })
      }
    }
  }
</script>

<style scoped>
  .confirm-order {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .order-map {
    padding: 0 20rpx;
    background-color: #FFF;
    line-height: 40rpx;
  }

  .order-title {
    display: flex;
    justify-content: space-between;
  }

  .map-name {
    font-weight: bold;
  }

  .goods-list {
    margin-top: 20rpx;
    background-color: #FFFFFF;
    padding: 20rpx 0;
  }

  .goods-content {
    margin-top: 20rpx;
    padding: 10rpx 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .goods-text {
    width: 360rpx;
    padding: 0 10rpx;
    font-size: 26rpx;
  }

  .goods-img {
    width: 160rpx;
    height: 160rpx;
  }

  .address {
    text-align: center;
    padding: 30rpx 20rpx;
    border: 2rpx solid #F6F6F6;
    color: #49BDFB;
  }

  .goods-name {
    font-size: 26rpx;
  }

  .goods-size {
    font-size: 24rpx;
  }

  .order-foot {
    height: 80rpx;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: #FFFFFF;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .total-price {
    padding: 0 20rpx;
  }

  .confirm {
    color: #FFFFFF;
    background-color: #49BDFB;
    padding: 10rpx 30rpx;
  }
</style>
