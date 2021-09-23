const HttpError = require("../errors/HttpError");
const jwt = require("jsonwebtoken");

module.exports.AuthCheck = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.userData = {userId: decodedToken.userId, firstName: decodedToken.firstName, lastName: decodedToken.lastName};
        next();
    } catch(e) {
        const error = new HttpError("Authorization failed", 401);
        return next(error);
    }
} 
