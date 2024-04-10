const express = require("express");
const app = express();
const cors = require("cors")
const db = require('./db');
const jwt = require('jsonwebtoken');



require('dotenv').config();
app.use(cors()) 
app.use(express.json())
app.use(express.urlencoded())
const nodemailer = require('nodemailer');


const secret_key = process.env.TOKEN_SECRET_KEY;
const email = process.env.EMAIL_ADDRESS
const password = process.env.PASSWORD


var transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  port: 465,
  service: 'gmail',
  auth: {
    user: email,
    pass: password
  }
});







function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}


app.post('/sendEmailOTP', (req, res) => {
  const { email } = req.body;

  const OTP = generateOTP();
  var mailOptions = {
    from: 'Antes3',
    to: email,
    subject: "OTP for SignUp",
    text: `Your OTP for Verification id ${OTP}`,

    html: `<body style="background-color: #f1f1f1; font-family: sans-serif; padding: 20px;">
                <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 40px;">
                    <h2 style="color: #333333; margin-top: 0;">One-Time Password (OTP) Verification</h2>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666;">Dear user,</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666;">Thank you for using our service. Your one-time password (OTP) is:</p>
                    <div style="background-color: #f9f9f9; border: 1px solid #dddddd; padding: 10px; margin-bottom: 20px; font-size: 24px; font-weight: bold; color: #333333;">
                        ${OTP}
                    </div>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666;">Please enter this code on the verification page to complete your registration</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666;">If you did not request this OTP, please ignore this email and donot share this OTP with any one.</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666;">Thank you,</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666;">Team EventEase</p>
                </div>
            </body>`
  };



  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(500).send({ message: "Error Occured" });
    } else {
      res.send({ OTP: OTP, message: "OTP sent successfully" })

    }
  });


});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {

    if (results.length > 0) { 
        const user_id = results[0].user_id;
        if (results[0].password === password) {
          res.status(200).json({ message: 'Login Successful', email, user_id })
        }
        else {
          res.status(200).json({ message: 'Invalid Password' })

        }
    } else {
      res.status(200).json({ message: 'Email Not Found' })
    }
  });
});

app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {

    if (results.length > 0) {
          res.status(200).json({ message: 'Email Already exists' })
    } else {
      db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (insertError, insertResults) => {
        if (insertError) {
          console.log(insertError);
            res.json({ error: 'Error occurred while inserting data' });
        } else {
          console.log(insertResults);
            res.status(200).json({ message: 'User signed up successfully' });
        }
    });
    }
  });

});


app.get('/categories', (req, res) => {
  db.query('SELECT * FROM product_categories', (error, results) => {
    if (error) {
      console.error('Error fetching categories:', error);
      res.json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/get_products_from_types', (req, res) => {
  const type = req.body.type;
  db.query('SELECT * FROM productData WHERE type = ?', [type], (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

 
app.post('/orders', (req, res) => {
  const { email,product_name, price, quantity,image, size, color,order_date } = req.body;
  const sql = 'INSERT INTO orders (email,product_name, price,image, quantity, size, color,order_date) VALUES (?, ?, ?,?, ?, ?, ?, ?)';
  const values = [email,product_name, price, image,quantity, size, color,order_date];
  
  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.json({ error: 'Internal server error' });
    } else {
      res.json({ message: 'Data added successfully', orderId: results.insertId });
    }
  });
});

app.post('/getOrders', (req, res) => {
  const email = req.body.email;
  const sql = 'SELECT * FROM orders WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error executing query: ' + err);
      res.send('Error retrieving data');
      return;
    }
    res.json(results);
  });
});







app.listen(3001, () => {
  console.log("Server running");
});