const express = require("express");

const router = express.Router();

const { register ,verify ,generateNewVerificationLink,login} = require("../controllers/userAuthController.js");



//user register route
router.post("/register", register);

// user login route
router.post("/login", login);

// user verification link check route
router.get("/verify/:token", verify);

// user verification link new generate route
router.get("/newlink", generateNewVerificationLink);





module.exports =  router ;