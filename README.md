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

## 作品展示
![}YAS_L(}%L6NE9{)WSGHA(D](https://user-images.githubusercontent.com/107788475/197437838-f6f594b2-eb2d-43c3-a98c-f05bb19dbbd5.png)![$VQ(Z 05WAMCT0YN~L5)ZA9](https://user-images.githubusercontent.com/107788475/197437853-0a2b372c-8be8-405d-a5b0-fc74c50479bf.png)![ZQL5@ZYNR5RVR46(MIIMM D](https://user-images.githubusercontent.com/107788475/197437860-57dc2167-0917-404e-8e58-7e62c7393756.png)![7QSG WKENY $RQ0C (ALYJV](https://user-images.githubusercontent.com/107788475/197437866-61959c54-4a88-4230-9f94-80d4cdfd66cd.png)![5Z%YE`7PVMS7M $R(HG3FG0](https://user-images.githubusercontent.com/107788475/197438123-9c9853ae-96cc-4c34-ba14-114e437dcb9e.png)![)BFS9{KI1G_1@A(%2~V_B69](https://user-images.githubusercontent.com/107788475/197438155-bcbf94b9-4636-4579-8388-5c965a99a19a.png)





