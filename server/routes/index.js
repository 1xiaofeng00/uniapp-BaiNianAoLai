var express = require("express");
var router = express.Router();
var connection = require("../db/db")
var users = require('../db/UserSql')
const SMSClient = require('@alicloud/sms-sdk')
const jwt_decode = require('jwt-decode');
const alipaySdk = require('../db/alipay.js');
const AlipayFormData = require('alipay-sdk/lib/form').default;

//支付接口
router.post('/api/payment', function(req, res, next) {
    //接收前端给后端的订单号
    let orderId = req.body.orderId;
    
    const formData = new AlipayFormData();
    //调用get方法
    formData.setMethod('get'),
    //支付时 的信息
    formData.addField('bizContent', {
      outTradeNo: orderId,//订单号
      productCode: 'FAST_INSTANT_TRADE_PAY',//写死的
      totalAmount: '0.01',//金额
      subject: '商品'//商品名称
    });
    //支付成功或者失败打开的页面
    formData.addField('returnUrl', 'http://www.xuexiluxian.cn/');
    const result = alipaySdk.exec(
      'alipay.trade.page.pay',
      {},
      { formData: formData },
    );
    result.then(resp=>{
        res.send({
            data:{
                code:200,
                success:true,
                paymentUrl:resp
            }
        })
    })
})

//修改订单
router.post('/api/submitOrder', function(req, res, next) {
  let token = req.headers.token;
  let phone = jwt_decode(token);
  //订单号
  let orderId = req.body.orderId;
  //购物车中选中的商品
  let shopArr=req.body.shopArr;
  connection.query(`select * from user where phone = ${phone.name}`, function (error, results, fields) {
    //当前用户的id
    let userId = results[0].id;
    connection.query(`select * from store_order where uid=${userId} and order_id=${orderId}`,function(err,result){
      //订单的id(不是订单号)
      let id=result[0].id;
      connection.query(`update store_order set order_status =replace(order_status,'1','2') where id=${id}`,function(){
        //清空购物车
        shopArr.forEach(v=>{
           connection.query(`delete from goods_cart where id = ${v}`,function(){
             
           })
        })
        res.send({
          data:{
            code:200,
            success:true
          }
        })
      })
    })
  })
})

//生成订单
router.post('/api/addOrder', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    //前端给后端传递的数据
    let goodsArr = req.body.arr;
    //生成订单号
    function setTimeDateFmt( s ){
        return s < 10 ? '0' + s : s;
    }
    function orderNumber(){
        const now = new Date();
        let fullYear = now.getFullYear();
        let month = setTimeDateFmt( now.getMonth() + 1 );
        let day = setTimeDateFmt( now.getDate() );
        let hour = setTimeDateFmt( now.getHours() );
        let minutes = setTimeDateFmt( now.getMinutes() );
        let seconds = setTimeDateFmt( now.getSeconds() );
        let orderCode = fullYear + month + day + hour + minutes + seconds + ( Math.round( Math.random() * 1000000 ));
        return orderCode;
    }
    //商品名称
    let goodsName = [];
    //订单总价
    let goodsPrice = 0;
    //订单商品总数量
    let goodsNum = 0;
    //订单号
    let orderId = orderNumber();
    
    goodsArr.forEach(v=>{
        goodsName.push(  v.name );
        goodsNum += parseInt(v.num);
        goodsPrice +=  v.num * v.pprice;
    })
    connection.query(`select * from user where phone = ${phone.name}`, function (error, results, fields) {
    	//当前用户id
    	let userId = results[0].id;
        connection.query(`insert into store_order (uid,order_id,goods_name,goods_price,goods_num,order_status) values ('${userId}','${orderId}','${goodsName}','${goodsPrice}','${goodsNum}','1')`,function(e,r){
            connection.query(`select * from store_order where uid = ${userId} and order_id = ${orderId}`,function(err,result){
                res.send({
                    data:{
                        code:200,
                        success:true,
                        data:result
                    }
                })
            })
        })
    })
})

//删除购物车商品数据
router.post('/api/deleteCart', function(req, res, next) {
  let goodsId=req.body.goodsId
  for(let i=0;i<goodsId.length;i++){
    connection.query(`delete from goods_cart where id=${goodsId[i]}`,function(error, results, fields){
      res.json({
        data:{
          success:true
        }
      })
    })
  }
})

//加入购物车
router.post('/api/addCart', function(req, res, next) {
	let token = req.headers.token;
	let phone = jwt_decode(token);
	//商品id
	let goods_id = req.body.goods_id;
	//用户输入的商品数量
	let num = req.body.num;
	connection.query(`select * from user where phone = ${phone.name}`, function (error, results, fields) {
		//当前用户id
		let userId = results[0].id;
		connection.query(`select * from goods_search where id = ${goods_id}`, function (err, result) {
			let name = result[0].name;
			let imgUrl = result[0].imgUrl;
			let pprice = result[0].pprice;
			//查询当前用户之前是否添加过这个商品
			connection.query(`select * from goods_cart where uid = ${userId} and goods_id = ${goods_id}`, function (err, data) {
				if( data.length > 0){
					//如果当前用户已经添加过本商品,就让数量增加
					connection.query(`update goods_cart set num = replace(num,${data[0].num},${ parseInt(num) + parseInt(data[0].num) }) where id = ${data[0].id}`, function (e, r) {
						res.json({
							data:{
								success:"加入成功"
							}
						})
					})
				}else{
					//如果当前用户之前没有加入过本商品,需要添加进入
					connection.query('insert into goods_cart (uid,goods_id,name,imgUrl,pprice,num) values ("'+userId+'","'+goods_id+'","'+name+'","'+imgUrl+'","'+pprice+'","'+num+'")', function (err, data) {
						res.json({
							data:{
								success:"加入成功"
							}
						})
					})
				}
			})
		})
	})
})

//修改当前用户购物车商品数量
router.post('/api/updateNumCart', function(req, res, next) {
	let token = req.headers.token;
	let phone = jwt_decode(token);
	//商品id
	let goodsId = req.body.goodsId;
	//用户输入的商品数量
	let num = req.body.num;
	connection.query(`select * from user where phone = ${phone.name}`, function (error, results, fields) {
		//当前用户id
		let userId = results[0].id;
		connection.query(`select * from goods_cart where uid = ${userId} and goods_id = ${goodsId}`, function (err, result) {
			//数据中当前的数量
			let goods_num = result[0].num;
			//当前的id号
			let id = result[0].id;
			//修改[替换]
			connection.query(`update goods_cart set num = replace(num,${goods_num},${num}) where id = ${id}`, function (e, r) {
				res.json({
					data:{
						success:true
					}
				})
			})
		})
	})
})


//获取当前用户购物车列表
router.post('/api/selectCart', function(req, res, next) {
  let token = req.headers.token;
  let phone = jwt_decode(token);
  //拿到当前用户
  connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
    let userId = results[0].id;
    //拿到当前用户所有的数据
    connection.query(`select * from goods_cart where uid = ${userId}`, function(err, result, field) {
      res.json({
        data: result
      })
    })
  })
})


//当前用户修改收货地址
router.post('/api/updateAddress', function(req, res, next) {
  let token = req.headers.token;
  let phone = jwt_decode(token);
  let name = req.body.name;
  let tel = req.body.tel;
  let province = req.body.province;
  let city = req.body.city;
  let district = req.body.district;
  let address = req.body.address;
  let isDefault = req.body.isDefault;
  let id = req.body.id;
  //获取userId 号主
  connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
    let userId = results[0].id;
    //获取点击的是哪个地址
    connection.query(`select * from address where userId = ${userId} and isDefault = ${isDefault}`, function(
      err, result) {
      let childId = result[0].id;
      //replace 将isDefault中所有的1变为0
      connection.query(`update address set isDefault = replace(isDefault,"1","0") where id = ${childId}`,
        function(e, r) {
          let updateSql =
            `update address set name = ?,tel = ?,province = ?,city = ?,district = ?,address = ?,isDefault = ?,userId = ? where id = ${id}`
          connection.query(updateSql, [name, tel, province, city, district, address, isDefault, userId],
            function(err, result) {
              res.send({
                data: {
                  success: '成功'
                }
              })
            })
        })
    })
  })
})

//当前用户新增收货地址
router.post('/api/addAddress', function(req, res, next) {
  let token = req.headers.token;
  let phone = jwt_decode(token);
  let name = req.body.name;
  let tel = req.body.tel;
  let province = req.body.province;
  let city = req.body.city;
  let district = req.body.district;
  let address = req.body.address;
  let isDefault = req.body.isDefault;

  connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
    let id = results[0].id;
    let sqlInert = 'insert into address (name,tel,province,city,district,address,isDefault,userId) values ("' +
      name + '","' + tel + '","' + province + '","' + city + '","' + district + '","' + address + '","' +
      isDefault + '","' + id + '")';
    connection.query(sqlInert, function(err, result, field) {
      res.send({
        data: {
          success: "成功"
        }
      })
    })
  })
})

//当前用户查询收货地址
router.post('/api/selectAddress', function(req, res, next) {
  let token = req.headers.token;
  let phone = jwt_decode(token);
  console.log(phone);
  connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
    let id = results[0].id;
    connection.query(`select * from address where userId = ${id}`, function(err, result, field) {
      res.send({
        data: result
      })
    })
  })
})

//第三方登录
router.post('/api/loginother', function(req, res, next) {
  let params = {
    provider: req.body.provider,
    openId: req.body.openId,
    nickName: req.body.nickName,
    avatarUrl: req.body.avatarUrl
  }
  //查询数据库中有没有此用户
  connection.query(users.queryUserName(params), function(err, result) {
    if (result.length > 0) {
      //数据库中存在    :读取
      connection.query(users.queryUserName(params), function(e, r) {
        res.send({
          data: r[0]
        })
      })
    } else {
      //数据库中不存在： :存储
      connection.query(users.insertData(params), function(error, results, fields) {
        connection.query(users.queryUserName(params), function(e, r) {
          res.send({
            data: r[0]
          })
        })
      })
    }
  })
})


//验证码
let codes = "";
//注册===>增加一条数据
router.post('/api/addUser', function(req, res, next) {
  //前端给后端的数据
  let params = {
    userName: req.body.userName,
    userCode: req.body.code
  };
  if (params.userCode == codes) {
    //增加完 就查询 ==> 注册完 自动登录
    connection.query(users.insertData(params), function(error, results, fields) {
      connection.query(users.queryUserName(params), function(err, result) {
        res.send({
          data: {
            success: true,
            msg: "注册成功",
            data: result[0]
          }
        })
      })
    })
  }
})

// 产生6位随机数(用来生成短信验证码的)
function getCode() {
  let str = "";
  for (let i = 0; i < 6; i++) {
    str += parseInt(Math.random() * 10)
  }
  return str;
}

//发送验证码
router.post('/api/code', function(req, res, next) {
  //前端给后端的数据
  let phoneNum = req.body.userName;
  console.log("手机号码", phoneNum);
  // 初始化sms_client
  let smsClient = new SMSClient({
    accessKeyId: "xxxxxxxxxxxxx",//保密
    secretAccessKey: "xxxxxxxxxxxxxxx"//保密
  });
  let str1 = getCode();
  codes = str1;
  //开始发送短信
  smsClient.sendSMS({
    PhoneNumbers: phoneNum,
    SignName: "阿里云短信测试", //签名名称 
    TemplateCode: "SMS_154950909", //模版CODE 
    TemplateParam: `{"code":'${str1}'}`, // 短信模板变量对应的实际值，JSON格式
  }).then(result => {
    console.log("result", result)
    let {
      Code
    } = result;
    if (Code == 'OK') {
      res.send({
        data: {
          success: true,
          code: str1
        }
      })
    }
  }).catch(err => {
    console.log(err);
    res.json({
      code: 1,
      msg: 'fail'
    })
  })
})

//注册手机号是否存在
router.post('/api/registered', function(req, res, next) {
  // 前端给后端的数据
  let params = {
    userName: req.body.phone,
  }
  //查询手机号是否存在
  connection.query(users.queryUserName(params), function(error, results, fields) {
    if (results.length > 0) {
      res.send({
        data: {
          success: false,
          msg: "手机号已经存在",
        }
      })
    } else {
      res.send({
        data: {
          success: true,
        }
      })
    }
  })

})

//用户登录
router.post('/api/login', function(req, res, next) {
  //前端给后端的数据
  let params = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }

  //查询用户名或者手机号存在不存在
  connection.query(users.queryUserName(params), function(error, results, fields) {
    if (results.length > 0) {
      connection.query(users.queryUserPwd(params), function(err, result) {
        if (result.length > 0) {
          res.send({
            data: {
              success: true,
              msg: "登录成功",
              data: result[0]
            }
          })
        } else {
          res.send({
            data: {
              success: false,
              msg: "密码不正确"
            }
          })
        }
      })
    } else {
      res.send({
        data: {
          success: false,
          msg: "用户名或手机号不存在"
        }
      })
    }
  })
});

//允许跨域
router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // Access-Control-Allow-Headers：可根据浏览器的F12查看，把对应的粘贴在这里就行
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

//点击商品进入商品详情
router.get("/api/goods/id", function(req, res, next) {
  let id = req.query.id;
  connection.query("select * from goods_search where id=" + id + "",
    function(error, results, fields) {
      if (error) throw error;
      res.send({
        code: "0",
        data: results
      })
    });
})
// 搜索列表页
router.get("/api/goods/list", function(req, res, next) {
  res.json({
    code: 0,
    data: [{
        id: 1,
        name: "家居家纺",
        data: [{
            name: "家纺",
            list: [{
                id: 1,
                name: "毛巾/浴巾",
                imgUrl: "../../static/list/maojin.jpg"
              },
              {
                id: 2,
                name: "枕头",
                imgUrl: "../../static/list/zhentou.jpg"
              }
            ]
          },
          {
            name: "生活用品",
            list: [{
                id: 1,
                name: "浴室用品",
                imgUrl: "../../static/list/yushiyongpin.jpg"
              },
              {
                id: 2,
                name: "洗晒",
                imgUrl: "../../static/list/xishai.jpg"
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: "女装",
        data: [{
            name: "裙装",
            list: [{
                id: 1,
                name: "连衣裙",
                imgUrl: "../../static"
              },
              {
                id: 2,
                name: "半衣裙",
                imgUrl: "../../static"
              }
            ]
          },
          {
            name: "上衣",
            list: [{
                id: 1,
                name: "T恤",
                imgUrl: "../../static"
              },
              {
                id: 2,
                name: "衬衫",
                imgUrl: "../../static"
              }
            ]
          }
        ]
      }, {
        id: 3,
        name: "鞋包",
        data: []
      }, {
        id: 4,
        name: "美白护肤",
        data: []
      }, {
        id: 5,
        name: "运动健身",
        data: []
      }, {
        id: 6,
        name: "数码电子",
        data: []
      }, {
        id: 7,
        name: "家用电器",
        data: []
      }, {
        id: 8,
        name: "食品生鲜",
        data: []
      },
      {
        id: 9,
        name: "家用电器",
        data: []
      },
      {
        id: 10,
        name: "数码电子",
        data: []
      }, {
        id: 11,
        name: "家用电器",
        data: []
      }, {
        id: 12,
        name: "医药保健",
        data: []
      }, {
        id: 13,
        name: "食品生鲜",
        data: []
      }, {
        id: 14,
        name: "医药保健",
        data: []
      }, {
        id: 15,
        name: "食品生鲜",
        data: []
      },
    ]
  })
})
//搜索
router.get("/api/goods/search", function(req, res, next) {
  //获取对象的key
  let [goodsName, orderName] = Object.keys(req.query);
  //name参数的值
  let name = req.query.name;
  //orderName的key的值
  let order = req.query[orderName]
  //desc降序 asc升序
  connection.query("select * from goods_search where name like '%" + name + "%' order by " + orderName + " " +
    order + "",
    function(error, results, fields) {
      if (error) throw error;
      res.send({
        code: "0",
        data: results
      })
    });
})

// 首页
router.get("/api/index_list/data", function(req, res, next) {
  res.json({
    code: 0,
    data: {
      topBar: [{
          id: 1,
          name: "推荐",
        },
        {
          id: 2,
          name: "运动户外",
        },

        {
          id: 3,
          name: "服饰内衣",
        },
        {
          id: 4,
          name: "鞋靴箱包",
        },

        {
          id: 5,
          name: "美妆个护",
        },
        {
          id: 6,
          name: "家具数码",
        },
        {
          id: 7,
          name: "食品母婴",
        },
      ],
      data: [
        // 轮播图
        {
          type: "swiperList",
          data: [{
              imgUrl: "../../static/swiper/swiper1.png",
            },
            {
              imgUrl: "../../static/swiper/swiper2.png",
            },
            {
              imgUrl: "../../static/swiper/swiper3.png",
            },
          ],
        },
        // 推荐商品
        {
          type: "recommendList",
          data: [{
              bigUrl: "../../static/recommend/big-top-1.jpg",
              data: [{
                  imgUrl: "../../static/recommend/small-1.jpg",
                },
                {
                  imgUrl: "../../static/recommend/small-2.jpg",
                },
                {
                  imgUrl: "../../static/recommend/small-3.jpg",
                },
              ],
            },
            {
              bigUrl: "../../static/recommend/big-top-2.jpg",
              data: [{
                  imgUrl: "../../static/recommend/small-4.jpg",
                },
                {
                  imgUrl: "../../static/recommend/small-5.jpg",
                },

                {
                  imgUrl: "../../static/recommend/small-6.jpg",
                },
              ],
            },
          ],
        },
        // 商品列表
        {
          type: "commodityList",
          data: [{
              id: 1,
              imgUrl: "../../static/commodity/item1.jpg",
              name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
              pprice: "199",
              oprice: "599",
              discount: "3.3",
            },
            {
              id: 2,
              imgUrl: "../../static/commodity/item2.jpg",
              name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
              pprice: "199",
              oprice: "599",
              discount: "3.3",
            },
            {
              id: 3,
              imgUrl: "../../static/commodity/item3.jpg",
              name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
              pprice: "199",
              oprice: "599",
              discount: "3.3",
            },
            {
              id: 4,
              imgUrl: "../../static/commodity/item4.jpg",
              name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
              pprice: "199",
              oprice: "599",
              discount: "3.3",
            },
            {
              id: 5,
              imgUrl: "../../static/commodity/item5.jpg",
              name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
              pprice: "199",
              oprice: "599",
              discount: "3.3",
            },
            {
              id: 6,
              imgUrl: "../../static/commodity/item6.jpg",
              name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
              pprice: "199",
              oprice: "599",
              discount: "3.3",
            },
          ],
        },
      ],
    },
  });
});
//首页第一次触底的数据
router.get("/api/index_list/1/data/2", function(req, res, next) {
  res.json({
    code: "0",
    data: [{
      type: "commodityList",
      data: [{
          id: 1,
          imgUrl: "../../static/commodity/item1.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 2,
          imgUrl: "../../static/commodity/item2.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 3,
          imgUrl: "../../static/commodity/item3.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 4,
          imgUrl: "../../static/commodity/item4.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 5,
          imgUrl: "../../static/commodity/item5.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 6,
          imgUrl: "../../static/commodity/item6.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
      ],
    }, ]
  })
})
//运动户外第一次触底的数据
router.get("/api/index_list/2/data/2", function(req, res, next) {
  res.json({
    code: "0",
    data: [{
      type: "commodityList",
      data: [{
          id: 1,
          imgUrl: "../../static/commodity/item1.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 2,
          imgUrl: "../../static/commodity/item2.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 3,
          imgUrl: "../../static/commodity/item3.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 4,
          imgUrl: "../../static/commodity/item4.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 5,
          imgUrl: "../../static/commodity/item5.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 6,
          imgUrl: "../../static/commodity/item6.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
      ],
    }, ]
  })
})
//触底第二次
router.get("/api/index_list/2/data/3", function(req, res, next) {
  res.json({
    code: "0",
    data: [{
      type: "commodityList",
      data: [{
          id: 1,
          imgUrl: "../../static/commodity/item1.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 2,
          imgUrl: "../../static/commodity/item2.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },

        {
          id: 3,
          imgUrl: "../../static/commodity/item3.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },

        {
          id: 4,
          imgUrl: "../../static/commodity/item4.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 5,
          imgUrl: "../../static/commodity/item5.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
        {
          id: 6,
          imgUrl: "../../static/commodity/item6.jpg",
          name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
          pprice: "199",
          oprice: "599",
          discount: "3.3",
        },
      ],
    }, ]
  })
})
// 运动户外
router.get("/api/index_list/2/data/1", function(req, res, next) {
  res.json({
    code: "0",
    data: [{
        type: "bannerList",
        imgUrl: "../../static/banner/item1.jpg",
      },
      {
        type: "iconsList",
        data: [{
            imgUrl: "../../static/icons/item1.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item2.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item3.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item4.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item5.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item6.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item7.png",
            name: "运动户外",
          },
          {
            imgUrl: "../../static/icons/item8.png",
            name: "运动户外",
          },
        ],
      },
      {
        type: "hotList",
        data: [{
            id: 1,
            imgUrl: "../../static/Hot/Hot1.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 2,
            imgUrl: "../../static/Hot/Hot2.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 3,
            imgUrl: "../../static/Hot/Hot3.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
        ],
      },
      {
        type: "shopList",
        data: [{
            bigUrl: "../../static/shop/shop.jpg",
            data: [{
                id: 1,
                imgUrl: "../../static/shop/shop1.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 2,
                imgUrl: "../../static/shop/shop2.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 3,
                imgUrl: "../../static/shop/shop3.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 4,
                imgUrl: "../../static/shop/shop4.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 5,
                imgUrl: "../../static/shop/shop5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 6,
                imgUrl: "../../static/shop/shop6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 7,
                imgUrl: "../../static/shop/shop5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 8,
                imgUrl: "../../static/shop/shop6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
            ],
          },
          {
            bigUrl: "../../static/shop/shop-big.jpg",
            data: [{
                id: 1,
                imgUrl: "../../static/shop/shop-1.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 2,
                imgUrl: "../../static/shop/shop-2.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 3,
                imgUrl: "../../static/shop/shop-3.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 4,
                imgUrl: "../../static/shop/shop-4.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },

              {
                id: 5,
                imgUrl: "../../static/shop/shop-5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 6,
                imgUrl: "../../static/shop/shop-6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",

              },
              {
                id: 7,
                imgUrl: "../../static/shop/shop-7.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 8,
                imgUrl: "../../static/shop/shop-8.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },

            ],
          },
          {
            type: "commodityList",
            data: [{
                id: 1,
                imgUrl: "../../static/commodity/item1.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 2,
                imgUrl: "../../static/commodity/item2.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 3,
                imgUrl: "../../static/commodity/item3.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 4,
                imgUrl: "../../static/commodity/item4.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 5,
                imgUrl: "../../static/commodity/item5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 6,
                imgUrl: "../../static/commodity/item6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
            ],
          },
        ],
      },
    ],
  });
});

router.get("/api/index_list/3/data/1", function(req, res, next) {
  res.json({
    code: "0",
    data: [{
        type: "bannerList",
        imgUrl: "../../static/banner/item1.jpg",
      },
      {
        type: "iconsList",
        data: [{
            imgUrl: "../../static/icons/icons1.png",
            name: "服饰内衣",
          },
          {
            imgUrl: "../../static/icons/icons2.png",
            name: "服饰内衣",
          },
          {
            imgUrl: "../../static/icons/icons3.png",
            name: "服饰内衣",
          },
          {
            imgUrl: "../../static/icons/icons4.png",
            name: "服饰内衣",

          },
          {
            imgUrl: "../../static/icons/icons5.png",
            name: "服饰内衣",
          },
          {
            imgUrl: "../../static/icons/icons6.png",
            name: "服饰内衣",
          },
          {
            imgUrl: "../../static/icons/icons7.png",
            name: "服饰内衣",
          },
          {
            imgUrl: "../../static/icons/icons8.png",
            name: "服饰内衣",
          },
        ],
      },
      {
        type: "hotList",
        data: [{
            id: 1,
            imgUrl: "../../static/Hot/Hot1.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 2,
            imgUrl: "../../static/Hot/Hot2.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
          {
            id: 3,
            imgUrl: "../../static/Hot/Hot3.jpg",
            name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
            pprice: "199",
            oprice: "599",
            discount: "3.3",
          },
        ],
      },
      {
        type: "shopList",
        data: [{
            bigUrl: "../../static/shop/shop.jpg",
            data: [{
                id: 1,
                imgUrl: "../../static/shop/shop1.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 2,
                imgUrl: "../../static/shop/shop2.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 3,
                imgUrl: "../../static/shop/shop3.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 4,
                imgUrl: "../../static/shop/shop4.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 5,
                imgUrl: "../../static/shop/shop5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 6,
                imgUrl: "../../static/shop/shop6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 7,
                imgUrl: "../../static/shop/shop5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 8,
                imgUrl: "../../static/shop/shop6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
            ],
          },
          {
            bigUrl: "../../static/shop/shop-big.jpg",
            data: [{
                id: 1,
                imgUrl: "../../static/shop/shop-1.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 2,
                imgUrl: "../../static/shop/shop-2.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },

              {
                id: 3,
                imgUrl: "../../static/shop/shop-3.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 4,
                imgUrl: "../../static/shop/shop-4.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 5,
                imgUrl: "../../static/shop/shop-5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },

              {
                id: 6,
                imgUrl: "../../static/shop/shop-6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 7,
                imgUrl: "../../static/shop/shop-7.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 8,
                imgUrl: "../../static/shop/shop-8.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
            ],
          },
          {
            type: "commodityList",
            data: [{
                id: 1,
                imgUrl: "../../static/commodity/item1.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 2,
                imgUrl: "../../static/commodity/item2.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 3,
                imgUrl: "../../static/commodity/item3.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 4,
                imgUrl: "../../static/commodity/item4.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
              {
                id: 5,
                imgUrl: "../../static/commodity/item5.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },

              {
                id: 6,
                imgUrl: "../../static/commodity/item6.jpg",
                name: "Lucky Ozasec女士新款气质翻领针织收腰连衣裙",
                pprice: "199",
                oprice: "599",
                discount: "3.3",
              },
            ],
          },
        ],
      },
    ],
  });
});
module.exports = router;