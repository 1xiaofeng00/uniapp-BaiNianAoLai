var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'xxxxxxxxx',
  database: 'uniapp_shop'
});
module.exports=connection