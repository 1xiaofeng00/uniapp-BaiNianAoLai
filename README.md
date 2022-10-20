# uniapp-BaiNianAoLai
百年奥莱(App) uni-app+Vuex+Nodejs+mysql
## 一、克隆本地  
git clone https://github.com/1xiaofeng00/uniapp-BaiNianAoLai.git  

## 二、编写数据库，存储数据  
#### 1.进入项目文件并打开文件夹 *server=>db=>db.js=>输入数据库密码*  
#### 2.打开数据库  
##### 创建数据库名为uniapp_shop，然后创建表，表信息如下：    
  user号主登录信息（id , userName , userPwd , phone , imgUrl , nickName , token）  
  address收货地址（id , name ,tel , province , city , district , address , isDefault , userid）  
  goods_cart购物车信息（id , uid , goods_id , name , imgUrl , pprice , num）  
  goods_search商品信息（id , imgUrl , name , pprice , oprice , discount）  
  store_order订单信息（id ，uid , order_id , goods_name , goods_price , goods_num , order_status）  
  
## 三、运行后台  
1.cd server  
2.npm install  
3.npm start  

## 四、运行项目  
1.电脑连接手机，或者使用模拟器（雷电模拟器）并打开模拟器  
2.使用HBuilder打开项目  
3.点击顶部运行=>运行到手机模拟器=>运行到基座  

## **注意**
短信验证码登录不可用，短信验证码服务只能提供个人测试使用，如需使用请去阿里云或者腾讯云购买短信包，然后打开 *server=>routes=>index.js* 找到373行完善代码
