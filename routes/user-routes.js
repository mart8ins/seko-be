const express = require("express");
const router = express.Router();
const {getAllUsers, getUser, getUsersConnections, requestConnection, acceptConnection} = require("../controlers/user-controler");
const {AuthCheck} = require("../middleware/auth-check");


router.get("/",AuthCheck, getAllUsers); // all users
router.get("/:uid",AuthCheck, getUser); // user
router.post("/:uid/connections/accept", AuthCheck, acceptConnection); // accept connection request
router.post("/:uid/connections/request", AuthCheck, requestConnection); // send connection request
router.get("/:uid/connections",AuthCheck, getUsersConnections); // user connections



module.exports = router;