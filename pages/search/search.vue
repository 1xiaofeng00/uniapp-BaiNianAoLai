<template>
  <view class="search">
    <Lines></Lines>
    <view class="search-item">

      <view class="search-title">
        <view class="f-color">最近搜索</view>
        <view class="iconfont icon-lajitong" @tap="clearHistory"></view>
      </view>

      <view v-if="searchData.length>0">
        <view 
          class="search-name f-color" 
          v-for="(item,index) in searchData" 
          :key="index"
          @tap="toSearchList(item)"
          >{{item}}</view>
      </view>
      <view v-else class="search-end">
        暂无搜索记录
      </view>
      <view class="search-title">
        <view class="f-color">热门搜索</view>
      </view>

      <view>
        <view class="search-name f-color">四件套</view>
        <view class="search-name f-color">面膜</view>
      </view>

    </view>
  </view>
</template>

<script>
  import Lines from '@/components/common/line.vue'
  export default {
    data() {
      return {
        //输入的关键词
        keyword: "",
        //搜索过的词记录
        searchData: []
      }
    },
    components: {
      Lines
    },
    // 页面加载的时候
    onLoad() {
      uni.getStorage({
        key: "searchData",
        success: (res) => {
          this.searchData = JSON.parse(res.data)
        }
      })
    },
    // 监听原生标题栏搜索输入框输入内容变化事件
    onNavigationBarSearchInputChanged(e) {
      this.keyword = e.text
    },
    // 监听原生标题栏按钮点击事件，参数为Object
    onNavigationBarButtonTap(e) {
      this.search()
    },
    // 监听原生标题栏搜索输入框搜索事件，用户点击软键盘上的“搜索”按钮时触发。
    onNavigationBarSearchInputConfirmed() {
      this.search()
    },
    methods: {
      search() {
        if (this.keyword === '') {
          return uni.showToast({
            title: "关键词不能为空",
            icon: "none"
          })
        } else {
          //点击搜索或者搜索记录跳转
          this.toSearchList(this.keyword);
        }
        uni.hideKeyboard(),
          this.addSearch()
      },
      //记录最近搜索词
      addSearch() {
        let idx = this.searchData.indexOf(this.keyword);
        if (idx < 0) {
          this.searchData.unshift(this.keyword)
        } else {
          //搜索到相同的话，先删除原有的 再在前面添加
          this.searchData.unshift(this.searchData.splice(idx, 1)[0])
        }
        uni.setStorage({
          key: "searchData",
          data: JSON.stringify(this.searchData)
        })
      },
      //清除搜索记录
      clearHistory(){
        uni.showModal({
          title:"重要提示",
          content:"是否要清楚搜索记录",
          cancelText:"取消",
          confirmText:"确定",
          success: (res) => {
            // 判断用户点击的是取消还是确定
            if(res.confirm){
              uni.removeStorage({
                 key: "searchData",
              })
              this.searchData=[]
            }
          }
        })
      },
      //点击搜索或者搜索记录跳转
      toSearchList(item){
        uni.navigateTo({
          url: "../search-list/search-list?keyword="+item+""
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .search-item {
    padding: 20rpx;

    .search-title {
      display: flex;
      justify-content: space-between;
    }

    .search-name {
      padding: 4rpx 24rpx;
      background-color: #E1E1E1;
      display: inline-block;
      border-radius: 26rpx;
      margin: 10rpx 10rpx
    }
  }

  .search-end {
    text-align: center;
  }
</style>
