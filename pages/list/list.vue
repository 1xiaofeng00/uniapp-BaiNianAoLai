<template>
  <view>
    <Lines></Lines>
    <view class="list">
      <!-- 左侧滑动 -->
      <scroll-view scroll-y="true" class="list-left" :style="'height:'+clentHeight+'px;'">
        <view v-for="(item,index) in leftData" :key="index" class="left-item" @tap="changeLeftTap(index,item.id)">
          <view class="left-name" :class="activeIndex===index?'left-name-active':''">{{item.name}}</view>
        </view>
      </scroll-view>

      <!-- 右侧滑动 -->
      <scroll-view scroll-y="true" class="list-right" :style="'height:'+clentHeight+'px;'">
        
        <view class="right-list" v-for="(item,index) in rightData" :key="index">
         <block v-for="(k,i) in item" :key="i">
           <view class="list-title">{{k.name}}</view>
           <view class="right-content">
             <view class="right-item" v-for="(v,idx) in k.list" :key="idx">
               <image :src="v.imgUrl" mode="" class="right-img"></image>
               <view class="right-name">{{v.name}}</view>
             </view>
           </view>
         </block>
        </view>
        
      </scroll-view>

    </view>
   <Tabbar cureentPage='list'></Tabbar>
  </view>
</template>

<script>
  import Tabbar from "@/components/common/Tabbar.vue"
  import Lines from '@/components/common/line.vue'
  import $http from '@/common/api/request.js'
  export default {
    data() {
      return {
        
        clentHeight: 0,
        // 从1开始高亮
        activeIndex: 0,
        //左侧数据
        leftData:[],
        // 右侧数据
        rightData:[],
      }
    },
    components: {
      Lines,
      Tabbar
    },
    onReady() {
      //获取可视高度
      uni.getSystemInfo({
        success: (res) => {
          this.clentHeight = res.windowHeight
        }
      })
    },
    onLoad() {
      this.getData()
    },
    methods: {
      //请求数据的方法
      getData(id) {
        if(id===(this.activeIndex+1)){
          return;
        }
        $http.request({
          url: "/goods/list",
        }).then((res) => {
          let leftData = []
          let rightData = []
          res.forEach(v => {
            leftData.push({
              id: v.id,
              name: v.name,
            })
            //如果点击的id值相同
            if(v.id===(this.activeIndex+1)){
              rightData.push(v.data);
            }
          })
          this.leftData = leftData
          this.rightData = rightData
        }).catch(() => {
          uni.showToast({
            title: "请求失败!",
            icon: "none"
          })
        })
      },
      // 左侧点击事件
      changeLeftTap(index,id) {
        this.getData(id)
        this.activeIndex = index;
      }
    },
    //input输入框点击事件
    onNavigationBarSearchInputClicked() {
      uni.navigateTo({
        url: "../search/search"
      })
    }
  }
</script>

<style scoped lang="less">
  .list {
    display: flex;

    .list-left {
      width: 200rpx;

      .left-item {
        border-bottom: 2rpx solid #FFFFFF;
        font-size: 28rpx;
        font-weight: bold;
        background-color: #F7F7F7;

        .left-name {
          padding: 30rpx 6rpx;
          text-align: center;
        }

        .left-name-active {
          border-left: 8rpx solid #49BDFB;
          background-color: #FFFFFF;
        }
      }
    }

    .list-right {
      flex: 1;

      padding-left:30rpx .list-title {
        font-weight: bold;
        padding: 30rpx 0;
      }

      .right-content {
        display: flex;
        flex-wrap: wrap;

        .right-item {
          width: 150rpx;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10rpx;

          .right-img {
            width: 150rpx;
            height: 150rpx;
          }

          .right-name {
            margin: 16rpx 0;
            text-align: center;
          }
        }
      }
    }
  }
</style>
