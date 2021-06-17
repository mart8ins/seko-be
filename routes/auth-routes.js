const express = require("express");
const router = express.Router();
const {check} = require("express-validator");
const {SignupUser} = require("../controlers/auth-controler");

const validationOptions = [
    check("password").isLength({min: 3}), 
    check("email").isEmail().normalizeEmail(),
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty()
];


// router.post("/login", (req, res, next)=> {
//     console.log(req.body)
//     res.json({message: "Login success"});
// })

router.post("/signup", validationOptions, SignupUser);




module.exports = router;