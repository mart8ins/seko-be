const express = require("express");
const router = express.Router();
const {check} = require("express-validator");
const {SignupUser, LoginUser} = require("../controlers/auth-controler");

const signupValidation = [
    check("password").isLength({min: 3}), 
    check("email").isEmail().normalizeEmail(),
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty()
];
const loginValidation = [
    check("password").isLength({min: 3}), 
    check("email").isEmail().normalizeEmail()
];


router.post("/login", loginValidation, LoginUser);
router.post("/signup", signupValidation, SignupUser);

module.exports = router;