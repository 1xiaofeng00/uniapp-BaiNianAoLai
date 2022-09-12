<template>
  <view class="details">
    <!-- 商品图 -->
    <swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
      <swiper-item>
        <view class="swiper-item">
          <image :src="goodsContent.imgUrl" mode="" class="swiper-img"></image>
        </view>
      </swiper-item>
    </swiper>
    <!-- 价格和名称 -->
    <view class="details-goods">
      <view class="goods-price">
        <view class="goods-pprice">￥{{goodsContent.pprice}}</view>
        <view class="goods-oprice">￥{{goodsContent.oprice}}</view>
      </view>
      <view class="goods-name">{{goodsContent.name}}</view>
    </view>
    <!-- 商品详情 -->
    <view>
      <view>
        <image class="detail-img" src="../../static/details/detail1.jpg" mode=""></image>
      </view>
      <view>
        <image class="detail-img" src="../../static/details/detail2.jpg" mode=""></image>
      </view>
      <view>
        <image class="detail-img" src="../../static/details/detail3.jpg" mode=""></image>
      </view>
      <view>
        <image class="detail-img" src="../../static/details/detail4.jpg" mode=""></image>
      </view>
      <view>
        <image class="detail-img" src="../../static/details/detail5.jpg" mode=""></image>
      </view>
    </view>
    <!-- 商品列表 -->
    <Card cardTitle="看了又看"></Card>
    <CommodityList :dataList="dataList"></CommodityList>

    <!-- 底部 -->
    <view class="details-foot">
      <view class="iconfont icon-xiaoxi"></view>
      <view class="iconfont icon-gouwuchekong" @tap="goShopCart"></view>
      <view class="add-shopcart" @tap="showPop">加入购物车</view>
      <view class="buy" @tap="showPop">立即购买</view>
    </view>
    <!-- 底部弹出层 -->
    <view class="pop" v-show="isShow" @touchmove.stop.prevent="">
      <!-- 遮罩层 -->
      <view class="pop-mask" @tap="hidePop"></view>
      <!-- 内容块 -->
      <view class="pop-box" :animation="animationData">
        <view>
          <image class="pop-img" src="../../static/details/detail4.jpg" mode=""></image>
        </view>
        <view class="pop-num">
          <view>购买数量</view>
          <UniNumberBox :min="1" :value="num" @change="changeNumber"></UniNumberBox>
        </view>
        <view class="pop-sub">
          <view @tap="addCart">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import $http from "@/common/api/request.js"
  import UniNumberBox from "@/components/uni/uni-number-box/uni-number-box.vue"
  import Cart from "@/components/common/Card.vue"
  import CommodityList from "@/components/common/CommodityList.vue"
  import {mapMutations} from "vuex"
  export default {
    data() {
      return {
        isShow: false,
        goodsContent: [],
        num: 1,
        animationData: {},
        swiperList: [{
            imgUrl: "../../static/details/details1.jpeg"
          },
          {
            imgUrl: "../../static/details/details2.jpeg"
          },
          {
            imgUrl: "../../static/details/details3.jpeg"
          }
        ],
        dataList: [{
            id: 1,
            imgUrl: "../../static/commodity/item1.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 2,
            imgUrl: "../../static/commodity/item2.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 3,
            imgUrl: "../../static/commodity/item3.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 4,
            imgUrl: "../../static/commodity/item4.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 5,
            imgUrl: "../../static/commodity/item5.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 6,
            imgUrl: "../../static/commodity/item6.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },

        ]
      }
    },
    onLoad(e) {
      this.getData(e.id)
    },
    //点击分享
    onNavigationBarButtonTap(e) {
      if (e.type === "share") {
        uni.share({
          "provider": "weixin",
          "type": 0,
          "title": this.goodsContent.name,
          "scene": "WXSceneSession",
          "href": "http://192.168.1.8:8080/#/pages/details/details?id=" + this.goodsContent.id + "",
          success: function(res) {
            uni.showTabBar({
              title: "分享成功"
            })
          },
          fail: function(err) {
            console.log("fail:" + JSON.stringify(err));
          }
        })
      }
    },
    //修改返回的默认行为
    onBackPress() {
      if (this.isShow) {
        this.hidePop()
        return true;
      }
    },
    components: {
      Cart,
      CommodityList,
      UniNumberBox
    },
    methods: {
      ...mapMutations(['addShopCart']),
      //改变商品数量
      changeNumber(value) {
        this.num = value
      },
      //请求商品
      getData(id) {
        $http.request({
          url: "/goods/id",
          data: {
            id: id
          }
        }).then((res) => {
          this.goodsContent = res[0]
        }).catch(() => {
          title: "请求失败"
          icon: "none"
        })
      },
      showPop() {
        var animation = uni.createAnimation({
          duration: 200
        })
        // step()表示前面的动画执行完了
        animation.translateY(600).step()
        //export()方法调用后会清楚之前的动画操作
        this.animationData = animation.export()
        this.isShow = true
        setTimeout(() => {
          animation.translateY(0).step()
          this.animationData = animation.export()
        }, 200)
      },
      hidePop() {
        this.isShow = false
      },
      //跳转购物车页面
      goShopCart(){
        uni.navigateTo({
          url:"../shopcart/shopcart"
        })
      },
      // 加入购物车
      addCart(){
        $http.request({
          url: "/addCart",
          method:"POST",
          header:{
            token:true
          },
          data: {
            goods_id:this.goodsContent.id,
            num:this.num
          }
        }).then((res) => {
          uni.showToast({
            title:"成功加入购物车",
            icon:"none"
          })
        }).catch(() => {
          title: "请求失败"
          icon: "none"
        })
        uni.navigateBack({
          delta:1
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .details {
    padding-bottom: 90rpx;
  }

  swiper {
    width: 100%;
    height: 700rpx;

    .swiper-img {
      width: 100%;
      height: 700rpx;
    }
  }

  .details-goods {
    text-align: center;
    font-weight: bold;
    font-size: 36rpx;
    padding: 10rpx 0;
  }

  .goods-price {
    display: flex;
    height: 70rpx;
    margin: 20rpx 0;

    .goods-pprice {
      font-size: 60rpx;
      color: red;
    }

    .goods-oprice {
      padding-top: 30rpx;
      text-decoration: line-through;
    }
  }

  .detail-img {
    width: 100%;
  }

  .details-foot {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 90rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    background-color: #FFFFFF;
  }

  .details-foot .iconfont {
    width: 60rpx;
    height: 60rpx;
    text-align: center;
    line-height: 60rpx;
    border-radius: 100%;
    background-color: #000000;
    margin: 0 10rpx;
  }

  .add-shopcart {
    margin: 0 15rpx 0 30rpx;
    padding: 6rpx 30rpx;
    border-radius: 40rpx;
    background-color: #333;
  }

  .buy {
    margin: 0 15rpx;
    padding: 6rpx 30rpx;
    border-radius: 40rpx;
    background-color: deepskyblue;
  }

  .pop {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
  }

  .pop-mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .pop-box {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #FFFFFF;
  }

  .pop-img {
    width: 260rpx;
    height: 260rpx;
  }

  .pop-num {
    padding: 20rpx 20rpx;
    display: flex;
    justify-content: space-between;

  }

  .pop-sub {
    line-height: 80rpx;
    background-color: #49BDFB;
    color: #FFFFFF;
    text-align: center;
  }
</style>
