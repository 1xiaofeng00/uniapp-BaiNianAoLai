<template>
  <view>
    <view class="icons">
      <view class="icons-item" v-for="(item,index) in dataList" :key="index">
        <image class="icons-img" :src="item.imgUrl" mode=""></image>
        <text class="icons-name">{{item.name}}</text>
      </view>
    </view>
    <Card cardTitle="热销爆品"></Card>
  </view>
</template>

<script>
  import Card from '@/components/common/Card.vue'
  export default{
    props:{
      dataList:Array
    },
    components:{
      Card
    }
  }
</script>

<style scoped lang="less">
  .icons{
    display: flex;
    flex-wrap: wrap;
  }
  .icons-item{
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .icons-img{
      width: 80rpx;
      height: 80rpx;
    }
  }
</style>