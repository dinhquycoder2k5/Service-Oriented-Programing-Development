/* 
Starting server
Reading env file to take key
Use this key to connect to MongoDB
*/
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Read env file
dotenv.config();
//Create a instance of server
const app = express();
//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB is connected!');
  })
  .catch((err) => {
    console.error('Connection is failed!', err);
});
//Middleware to read JSON
app.use(express.json());
//Redirect to "route/auth.js"
app.use('/auth', require('./route/auth.js');
//Starting server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Auth Service đang chạy trên cổng ${PORT}`);
});

