<template>
  <view class="index">
    <scroll-view scroll-x="true" class="scroll-content" :scroll-into-view="scrollIntoIndex">
      <view class="scroll-item" :id="'top'+index" v-for="(item,index) in topBar" :key="index" @tap="changeTap(index)">
        <text :class='topBarIndex===index?"f-active-color":"f-color"'>{{item.name}}</text>
      </view>
    </scroll-view>

    <swiper @change="onChangeTap" :current="topBarIndex" :style="'height:'+clentHeight+'px;'">
      <swiper-item v-for="(item,index) in newTopBar" :key='index'>

        <scroll-view scroll-y="true" :style="'height:'+clentHeight+'px;'" @scrolltolower="loadMore(index)">
          <block v-if='item.data.length > 0'>
            <block v-for="(k,i) in item.data" :key="i">
              <!-- 组件 -->
              <!-- 推荐 -->
              <IndexSwiper v-if="k.type==='swiperList'" :dataList="k.data"></IndexSwiper>
              <template v-if="k.type==='recommendList'">
                <Recommend :dataList="k.data"></Recommend>
                <Card cardTitle="猜你喜欢"></Card>
              </template>

              <!-- 运动户外以及其他 -->
              <Banner v-if="k.type==='bannerList'" :dataList='k.imgUrl'></Banner>

              <Icons :dataList='k.data' v-if="k.type==='iconsList'"></Icons>

              <Hot :dataList='k.data' v-if="k.type==='hotList'"></Hot>

              <Shop :dataList='k.data' v-if="k.type==='shopList'"></Shop>

              <CommodityList v-if="k.type==='commodityList'" :dataList="k.data"></CommodityList>
            </block>
          </block>
          <view v-else>
            暂无数据....
          </view>
          <view class="load-text f-color">
            {{item.loadText}}
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
    <Tabbar cureentPage='index'></Tabbar>
  </view>
</template>

<script>
  import Tabbar from "@/components/common/Tabbar.vue"
  import $http from '@/common/api/request.js'
  import IndexSwiper from '@/components/index/indexSwiper.vue'
  import Recommend from '@/components/index/Recommend.vue'
  import Card from '@/components/common/Card.vue'
  import CommodityList from '@/components/common/CommodityList.vue'
  import Banner from '@/components/index/Banner.vue'
  import Icons from '@/components/index/Icons.vue'
  import Hot from '@/components/index/Hot.vue'
  import Shop from '@/components/index/Shop.vue'
  export default {
    data() {
      return {
        // 选中的索引
        topBarIndex: 0,
        //顶栏跟随的索引id值
        scrollIntoIndex: 'top0',
        //内容块的高度值
        clentHeight: 0,
        topBar: [],
        // 承载数据
        newTopBar: []
      }
    },
    components: {
      IndexSwiper,
      Recommend,
      Card,
      CommodityList,
      Banner,
      Icons,
      Hot,
      Shop,
      Tabbar
    },
    onLoad() {
      this.__init();
    },
    onReady() {
      // let view = uni.createSelectorQuery().select(".home-data");
      // view.boundingClientRect(data => {
      //   this.clentHeight=data.height;
      // }).exec()
      // this.getClentHeight();
      uni.getSystemInfo({
        success: (res) => {
          this.clentHeight = res.windowHeight - uni.upx2px(80)
        }
      })
    },
    onNavigationBarButtonTap(e){
      if(e.float=='left'){
        uni.navigateTo({
          url:"../search/search"
        })
      }
    },
    methods: {
      // 请求首页数据
      __init() {
        $http.request({
          url: "/index_list/data"
        }).then((res) => {
          this.topBar = res.topBar;
          this.newTopBar = this.initData(res)
        }).catch(() => {
          uni.showToast({
            title: "加载完毕!",
            icon: "none"
          })
        })
      },
      // 添加数据
      initData(res) {
        let arr = [];
        for (let i = 0; i < this.topBar.length; i++) {
          let obj = {
            data: [],
            load: "first",
            loadText: "上拉加载更多..."
          }
          // 首页
          if (i == 0) {
            obj.data = res.data;
          }
          arr.push(obj)
        }
        return arr;
      },
      // 点击顶栏 
      changeTap(index) {
        if (this.topBarIndex === index) {
          return;
        }
        this.topBarIndex = index
        this.scrollIntoIndex = 'top' + index

        //每次滑动=>赋值
        if (this.newTopBar[this.topBarIndex].load === 'first') {
          this.addData()
        }

      },
      // 对应滑动
      onChangeTap(e) {
        this.changeTap(e.detail.current);
      },
      // 对应显示不同数据
      addData(callBack) {
        // 拿到索引
        let index = this.topBarIndex
        //拿到id
        let id = this.topBar[index].id
        // 请求不同的数据
        let page = Math.ceil(this.newTopBar[index].data.length / 5) + 1;

        //请求数据
        $http.request({
          url: "/index_list/" + id + "/data/" + page + '',
        }).then((res) => {
          this.newTopBar[index].data = [...this.newTopBar[index].data, ...res];
        }).catch(() => {
          uni.showToast({
            title: "加载完毕!",
            icon: "none"
          })
        })
        this.newTopBar[index].load = 'last'
        if (typeof callback === 'function') {
          callback()
        }
      },
      loadMore(index) {
        this.newTopBar[index].loadText = '加载中...'
        // 请求完数据,文字提示信息又换成[上拉加载更多]
        //给addData传入一个callback
        this.addData(() => {
          this.newTopBar[index].loadText = '上拉加载更多...'
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .scroll-content {
    width: 100%;
    height: 80rpx;
    white-space: nowrap;

    .scroll-item {
      display: inline-block;
      padding: 10rpx 30rpx;
      font-size: 32rpx;

      .f-active-color {
        padding: 8rpx 0;
        border-bottom: 6rpx solid #49BDFB;
      }
    }
  }

  .load-text {
    border-top: 2rpx solid #636263;
    line-height: 60rpx;
    text-align: center;
  }
</style>
