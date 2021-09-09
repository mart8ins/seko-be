const User = require("../models/User");
const HttpError = require("../errors/HttpError");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const changeProfileData = async (req, res, next) => {
    try {
        const {userId} = req.userData;
        const { firstName, lastName, email } = req.body.data;
        const emailExists = await User.findOne({email: email});

        if(emailExists && String(emailExists._id) !== String(userId)) {
            res.json({error: "Email already in use."})
        } else {
            let user = await User.findOneAndUpdate(
                {_id: userId}, 
                {firstName, lastName, email}, 
                {new: true}
            );
        res.json({message: "Success", user: {firstName: user.firstName, lastName: user.lastName, email: user.email}})
        }
    } catch(e) {
        const error = new HttpError("Profile data change failed!", 400)
        next(error);
    }
}

const changeProfilePassword = async (req, res, next) => {
    try{
    const {userId} = req.userData;
    const {oldPassword, newPassword, repeatNewPassword} = req.body.data;
    const user = await User.findOne({_id: userId});

    const oldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if(oldPasswordCorrect && newPassword === repeatNewPassword) {
        const hash = await bcrypt.hash(newPassword, saltRounds);
        user.password = hash;
        await user.save();
        res.json({message: "Password changed!"});
    } else {
        res.json({error: "Failed to change password. Check you data."});
    }
    } catch(e){
        const error = new HttpError("Failed to change password.", 400);
        next(error);
    }
}

module.exports.changeProfileData = changeProfileData;
module.exports.changeProfilePassword = changeProfilePassword;