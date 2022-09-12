<template>
  <view class="recommend bg-color">
    
    <view class="recommend-item" v-for="(item,index) in dataList" :key="index">
      <image class="item-big" :src="item.bigUrl" mode=""></image>
      <view class="item-small">
        <block v-for="(k,i) in item.data" :key="i">
          <image class='item-small-img' :src="k.imgUrl" mode=""></image>
        </block>
      </view>
    </view>
    
    
  </view>
</template>

<script>
  export default{
    props:{
      dataList:Array
    }
  }
</script>

<style scoped lang="less">
  .recommend{
    padding: 20rpx;
    .recommend-item{
      display: flex;
      flex-direction: column;
      border-radius: 20rpx;
      border:2rpx solid #CCCCCC;
      overflow: hidden;
      margin: 20rpx auto;
      .item-big{
        width: 100%;
        height: 300rpx;
      }
      .item-small{
        width: 100%;
        height: 240rpx;
        // display: flex;
        // flex-direction: row;
        // justify-content: space-between;
        .item-small-img{
          width: 33.3%;
          height: 240rpx;
        }
      }
    }
  }
</style>