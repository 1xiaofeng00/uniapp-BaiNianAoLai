<template>
  <view class="banner">
    <image :src="dataList" mode=""></image>
  </view>
</template>

<script>
  export default{
    props:{
      dataList:String
    }
  }
</script>

<style scoped lang="less">
  .banner image{
    width: 100%;
    height: 370rpx;
  }
</style>