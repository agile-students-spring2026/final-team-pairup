// import and instantiate express
const express = require("express") // CommonJS import style!
const morgan = require("morgan") // CommonJS import style!
const multer = require("multer") // CommonJS import style!
const dotenv = require("dotenv") // CommonJS import style!
const axios = require("axios") // CommonJS import style!
const ejs = require("ejs") // CommonJS import style!

const app = express() // instantiate an Express object

app.use(morgan("dev")) // "dev" formatting is more readable for development
dotenv.config() // load environment variables from .env file


// we will put some server logic here later...

// export the express app we created to make it available to other modules
module.exports = app