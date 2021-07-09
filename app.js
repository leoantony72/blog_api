const express = require("express");
const app = express();
const cors = require("cors");
const getposts = require('./src/api-routes/getpost')
const newpost = require('./src/api-routes/newPost')
const morgan = require('morgan');


//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


//routes
app.use(getposts)
app.use(newpost)


app.get('/',(req,res) =>{
  res.send("hello")
})



//App Listen
app.listen(7000, () => {
    console.log("server started ");
  });
  