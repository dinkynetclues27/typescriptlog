const express = require('express');
const sequelize = require('./src/config/database')
require('dotenv').config();
const app = express();
const path = require("path")
const port = process.env.PORT
const cors = require('cors')
const bodyParser = require('body-parser');
const routers = require('./src/routes/route');





app.use(cors(
  // origin: "http://localhost:3000",
  // methods : ["GET", "POST"]


));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(routers);


sequelize;

app.listen(port, () => {
    console.log("Server is running on port 4000");
  });

