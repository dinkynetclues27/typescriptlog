const express = require('express');
const routers = express.Router()
const getvendorlist = require("../controllers/vendor");
const productinsert = require("../controllers/productinsert");
const {sseHandler }= require("../controllers/ssehandle");
const filesuccess = require('../controllers/filesuccess');
const filefail = require("../controllers/filefail")

routers.get("/getvendor",getvendorlist);
routers.post("/insertpro",productinsert);
routers.get('/events', sseHandler);
routers.get("/filesuccess",filesuccess)
routers.get("/filefail",filefail)

module.exports = routers;

