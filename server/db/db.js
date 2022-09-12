var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '*********',
  database: 'uniapp_shop'
});
module.exports=connection