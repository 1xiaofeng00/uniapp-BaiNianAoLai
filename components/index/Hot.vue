<template>
  <view class="">
    <Commodity :dataList='dataList' itemW='250rpx' imgH='220rpx'></Commodity>
     <Card cardTitle="推荐店铺"></Card> 
  </view>
</template>

<script>
  import Commodity from '../common/Commodity.vue' 
  import Card from '@/components/common/Card.vue'
  export default{
    props:{
      dataList:Array
    },
    components:{
      Commodity,
      Card
    }
  }
</script>

<style>
</style>