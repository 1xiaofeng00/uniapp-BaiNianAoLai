<template>
  <swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" loop="true" :circular="true">
    
    <swiper-item v-for="(item,index) in dataList" :key="index">
      <view class="swiper-item" >
        <image :src="item.imgUrl" mode=""></image>
      </view>
    </swiper-item>
   
  </swiper>
</template>

<script>
  export default{
    props:{
      dataList:Array,
    },
    data(){
      return{
        
      }
    }
  }
</script>

<style scoped>
  swiper{
    width: 100%;
    height: 400rpx;
  }
  .swiper-item image{
   width: 100%;
   height: 400rpx;
  }
</style>