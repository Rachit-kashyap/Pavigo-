const express = require('express');
const checkAuthorized = require("../middelware/userAuthMiddelware")
const router = express.Router();
const {getLoginUser} = require("../controllers/userAuthorizedController")

router.get("/",checkAuthorized,getLoginUser);



module.exports = router;