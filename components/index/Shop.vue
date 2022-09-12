<template>
  <view class="shop">
    
    <view class="shop-item" v-for="(item,index) in dataList" :key="index">
      <view class="shop-big">
         <image class="shop-big" :src="item.bigUrl" mode=""></image>
      </view>
      <scroll-view scroll-x="true" class="scroll-content">
        <view class='scroll-item'>
          <Commodity 
            :dataList='item.data' 
            wrap='no-wrap'
            itemW="200rpx"
            imgH="200rpx"
            nameSize="24rpx"
          ></Commodity>
        </view>
      </scroll-view>
    </view>
    <Card cardTitle="为你推荐"></Card>
  </view>
</template>

<script>
  import Card from '@/components/common/Card.vue'
  import Commodity from '@/components/common/Commodity.vue'
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

<style scoped lang="less">
 .shop-big{
   width: 100%;
   height: 350rpx;
 }
 .scroll-content{
   width: 100%;
   white-space: nowrap;
   .scroll-item{
     display: inline-block;
   }
 }
  
</style>