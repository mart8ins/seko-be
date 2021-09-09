const User = require("../models/User");
const HttpError = require("../errors/HttpError");

const changeProfileData = async (req, res, next) => {
    const {userId} = req.userData;
    const { firstName, lastName, email } = req.body.data;
    const emailExists = await User.findOne({email: email});

    try {
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

module.exports.changeProfileData = changeProfileData;