const {validationResult} = require("express-validator");
const HttpError = require("../errors/HttpError");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const SignupUser = async (req, res, next) => {
    const {firstName, lastName, email, password} = req.body;

    ///////////////////////////////////////////////// validation for input
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        const error = new HttpError(`Invalid input data, please check your data!`, 422);
        return next(error);
    }

    ///////////////////////////////////////////////// to check if youser already exists if not, create it
    try {
    const userExists = await User.findOne({email: email});
    if(userExists){
        const error = new HttpError("Email is Already Registered", 400);
        return next(error);
    }
    const newUser = await new User({
        firstName, 
        lastName,
        email,
        password: await bcrypt.hash(password, saltRounds)
    })
        await newUser.save();
        res.json({message: "Signup success", user: newUser});
    } catch(e){
        console.log(e)
    }
}

module.exports.SignupUser = SignupUser;