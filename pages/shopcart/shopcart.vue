<template>
  <view class="shopCart">

    <template v-if=" list.length>0">
      <!-- 自定义导航栏 -->
      <uniNavBar title="购物车" :rightText="isNavBar?'完成':'编辑'" fixed="true" statusBar="true"
        @clickRight="isNavBar=!isNavBar"></uniNavBar>

      <!-- 商品内容 -->
      <view class="shop-list">
        <view class="shop-item" v-for="(item,index) in list" :key="index">
          <label class="radio" @tap="selectedItem(index)">
            <radio value="" color="#FF3333" :checked="item.checked" /><text></text>
          </label>
          <image class="shop-img" :src="item.imgUrl" mode=""></image>
          <view class="shop-text">
            <view class="shop-name">{{item.name}}</view>
            <view class="shop-color f-color">{{item.color}}</view>
            <view class="shop-price">
              <view>￥{{item.pprice}}</view>
              <template v-if="!isNavBar">
                <view>x{{item.num}}</view>
              </template>
              <template v-else>
                <uniNumberBox :value="item.num" :min="1" @change="changeNumber($event,index,item)"></uniNumberBox>
              </template>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部 -->
      <view class="shop-foot">
        <label class="radio foot-radio" @tap="checkedAllFn">
          <radio value="" color="#FF3333" :checked="checkedAll" /><text>全选</text>
        </label>

        <template v-if="!isNavBar">
          <view class="foot-total">
            <view class="foot-count">合计:<text class="f-active-color">￥{{totalCount.pprice}}</text></view>
            <view class="foot-num" @tap="goConfirmOrder">结算({{totalCount.num}})</view>
          </view>
        </template>

        <template v-else>
          <view class="foot-total">
            <view class="foot-count" style="background-color:#000000;color: #FFFFFF;">移入收藏夹</view>
            <view class="foot-num" @tap="delGoodsFn">删除</view>
          </view>
        </template>

      </view>
    </template>
    <template v-else>
      <uniNavBar title="购物车" statusBar="true"></uniNavBar>
      <view class="shop-else-list">
        <text>购物车还是空的~</text>
      </view>
    </template>
    <Tabbar cureentPage='shopcart'></Tabbar>
  </view>
</template>

<script>
  import $http from "@/common/api/request.js"
  import Tabbar from "@/components/common/Tabbar.vue"
  import uniNavBar from "@/components/uni/uni-nav-bar/uni-nav-bar.vue"
  import uniNumberBox from "@/components/uni/uni-number-box/uni-number-box.vue"
  import {
    mapState,
    mapActions,
    mapGetters,
    mapMutations
  } from "vuex"
  export default {
    data() {
      return {
        isNavBar: false,
      }
    },
    computed: {
      ...mapState({
        list: state => state.cart.list,
        selectedList: state => state.cart.selectedList
      }),
      ...mapGetters(["checkedAll", "totalCount"])
    },
    components: {
      uniNavBar,
      uniNumberBox,
      Tabbar
    },
    onShow() {
      this.getData()
    },
    methods: {

      getData() {
        $http.request({
          url: "/selectCart",
          method: "POST",
          header: {
            token: true
          }
        }).then((res) => {
          this.initGetData(res)
        }).catch(() => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          })
        })
      },
      changeNumber(value, index, item) {
        if (item.number == value) return;
        $http.request({
          url: "/updateNumCart",
          method: "POST",
          header: {
            token: true
          },
          data: {
            goodsId: item.goods_id,
            num: value
          },
        }).then((res) => {
          this.list[index].num = value
        }).catch(() => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          })
        })
      },

      //确认订单
      goConfirmOrder() {
        if (this.selectedList.length === 0) {
          return uni.showToast({
            title: "请至少选择一件商品",
            icon: "none"
          })
        }

        let newList = [];
        this.list.forEach(item => {
          this.selectedList.filter(v => {
            if (item.id == v) {
              newList.push(item);
            }
          })
        })

        $http.request({
          url: "/addOrder",
          method: "POST",
          header: {
            token: true
          },
          data: {
            arr: newList
          } 
        }).then((res) => {
          if (res.success) {
            //存储订单号
            this.initOrder(res.data[0].order_id);
            //跳转页面
            uni.navigateTo({
              url: `../confirm-order/confirm-order?detail=${JSON.stringify(this.selectedList)}`
            })
          }
        }).catch(() => {
          uni.showToast({
            title: '请求失败',
            icon: 'none'
          })
        })

      },
      ...mapActions(['checkedAllFn', 'delGoodsFn']),
      ...mapMutations(['selectedItem', 'initGetData', 'initOrder']),
    }
  }
</script>

<style scoped>
  .shop-list {
    padding-bottom: 100rpx;
  }

  .shop-else-list {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f7f7f7;
    display: flex;
    justify-content: center;
    align-items: center
  }

  .shop-item {
    display: flex;
    padding: 20rpx;
    align-items: center;
    background-color: #f7f7f7;
    margin-bottom: 10rpx;
  }

  .shop-img {
    width: 200rpx;
    height: 200rpx;
  }

  .shop-text {
    flex: 1;
    padding-left: 20rpx;
  }

  .shop-color {
    font-size: 24rpx;
  }

  .shop-price {
    display: flex;
    justify-content: space-between;
  }

  .shop-foot {
    position: fixed;
    bottom: 120rpx;
    left: 0;
    width: 100%;
    height: 100rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #FFFFFF;
    border-top: 2rpx solid #f7f7f7;
  }

  .foot-radio {
    padding-left: 20rpx;
  }

  .foot-total {
    display: flex;
  }

  .foot-count {
    line-height: 100rpx;
    padding: 0 30rpx;
    font-size: 32rpx
  }

  .foot-num {
    background-color: #49BDFD;
    color: #FFFFFF;
    padding: 0 60rpx;
    line-height: 100rpx;
  }
</style>
