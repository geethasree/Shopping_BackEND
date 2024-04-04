const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'database-1.cxscskow2h4b.ap-south-1.rds.amazonaws.com', 
  user: 'admin', 
  password: 'test1234',
  database: 'shopping_app' 
});
 
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;
