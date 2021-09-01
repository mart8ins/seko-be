const {validationResult} = require("express-validator");
const HttpError = require("../errors/HttpError");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
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
        let token;
        token = jwt.sign(
            {userId: newUser.id, email: newUser.email},
            process.env.TOKEN_SECRET,
            {expiresIn: "1h"}
            )
        res.json({message: "Signup success", userId: newUser.id, email: newUser.email, token: token, fullName: `${newUser.firstName} ${newUser.lastName}`});
    } catch(e){
        return next(new HttpError("Unexpected error during signup!", 500));
    }
}

const LoginUser = async (req, res, next) => {
    const {email, password} = req.body;
      ///////////////////////////////////////////////// validation for input
      const validationErrors = validationResult(req);
      if(!validationErrors.isEmpty()){
          const error = new HttpError(`Invalid input data, please check your data!`, 422);
          return next(error);
      }

      // check credentials
      const user = await User.findOne({email});
      if(user && user.email === email) {
          const passwordMatch = await bcrypt.compare(password, user.password);
          if(passwordMatch) {

            let token;
            token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.TOKEN_SECRET,
            {expiresIn: "1h"}
            )
            return res.json({message: "Login Success", userId: user.id, email: user.email, token: token, fullName: `${user.firstName} ${user.lastName}`});
          }
      }
      // if credentials dont match, throw error
      const error = new HttpError("Invalid credentials!", 401);
      return next(error);
}

module.exports.SignupUser = SignupUser;
module.exports.LoginUser = LoginUser;