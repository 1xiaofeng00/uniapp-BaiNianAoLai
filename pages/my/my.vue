<template>
	<view class='my'>
		<!--头部-->
		<view class='my-header'>
			<view class='header-main'>
				<view class='header-config' @tap="goConfig">
					<image class='config-img' src="../../static/my/config.png" mode=""></image>
				</view>
				<view class='header-logo' >
					<image class='logo-img' :src="loginStatus? userInfo.imgUrl:'../../static/list/list1.jpg'" mode=""></image>
					<view class='logo-name'>{{ loginStatus ? userInfo.nickName:'用户昵称'}}</view>
				</view>
			</view>
		</view>
		<!--我的订单-->
		<view class='order'>
			<view class='order-title' @tap="goOrder">
				<view>我的订单</view>
				<view>全部订单 > </view>
			</view>
			<view class='order-list'>
				<view class='order-item'>
					<image  class='order-img' src="../../static/my/order1.png" mode=""></image>
					<view>待付款</view>
				</view>
				<view class='order-item'>
					<image  class='order-img' src="../../static/my/order2.png" mode=""></image>
					<view>待发货</view>
				</view>
				<view class='order-item'>
					<image  class='order-img' src="../../static/my/order3.png" mode=""></image>
					<view>待收获</view>
				</view>
				<view class='order-item'>
					<image  class='order-img' src="../../static/my/order4.png" mode=""></image>
					<view>待评价</view>
				</view>
				<view class='order-item'>
					<image  class='order-img' src="../../static/my/order5.png" mode=""></image>
					<view>退款处理</view>
				</view>
			</view>
		</view>
		<!--内容列表-->
		<view class='my-content'>
			
			<view class="my-content-item">
				<view>我的收藏</view>
				<view>></view>
			</view>
			<view class="my-content-item">
				<view>我的优惠券</view>
				<view>></view>
			</view>
			<view class="my-content-item">
				<view>我的积分</view>
				<view>></view>
			</view>
			<view class="my-content-item">
				<view>帮助中心</view>
				<view>></view>
			</view>
			<view class="my-content-item">
				<view>注销账号</view>
				<view>></view>
			</view>
			<view class="my-content-item">
				<view>联系客服</view>
				<view>></view>
			</view>
			<view class="my-content-item">
				<view>商家入驻</view>
				<view>></view>
			</view>
      <view class="my-content-item">
      	<view>百年奥莱隐私政策</view>
      	<view>></view>
      </view>
			
		</view>
    <Tabbar cureentPage='my'></Tabbar>
	</view>
</template>

<script>
  import Tabbar from "@/components/common/Tabbar.vue"
  import {mapState} from "vuex"
	export default {
		data() {
			return {
			
			}
		},
    components:{
      Tabbar
    },
    computed:{
      ...mapState({
        loginStatus:state=>state.user.loginStatus,
        userInfo:state=>state.user.userInfo,
      })
    },
		methods: {
      goOrder(){
        uni.navigateTo({
          url:"../my-order/my-order"
        })
      },
      goConfig(){
        uni.navigateTo({
          url:"../my-config/my-config"
        })
      }
		}
	}
</script>

<style scoped>
.my-header{
	background: url(../../static/my/mybg.png) no-repeat;
	width: 100%;
	height: 400rpx;
}
.header-main{
	position: relative;
	top:100rpx;
}
.header-config{
	position: absolute;
	left:20rpx;
}
.header-logo{
	position: absolute;
	left:50%;
	margin-left:-60rpx;
	width:120rpx;
}
.config-img{
	width: 40rpx;
	height: 40rpx;
}
.logo-img{
	width: 120rpx;
	height: 120rpx;
	border:2rpx solid #CCCCCC;
	border-radius: 50%;
	background-color: #FFFFFF;
}
.logo-name{
	font-weight: bold;
	color:#FFFFFF;
  font-size: 30rpx;
  text-align: center;
}
.order-title{
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
}
.order-list{
	padding: 20rpx;
	display: flex;
}
.order-item{
	flex:1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.order-img{
	width:66rpx;
	height: 66rpx;
}
.my-content{
	margin:20rpx 0;
	padding:0 20rpx;
}
.my-content-item{
	display: flex;
	justify-content: space-between;
	align-items:center;
	padding:20rpx 0; 
	border-bottom: 2px solid #CCCCCC;
}
</style>
