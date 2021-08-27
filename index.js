require('dotenv').config();


const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);

global.io = require("socket.io")(httpServer, {cors: {origin: "*"}});

const port = process.env.PORT || 3002;
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const HttpError = require("./errors/HttpError");


app.use(express.urlencoded({extended: true}), express.json());
app.use(cors());
app.use(session({
    secret: 'keyboard cat',
    store: MongoStore.create({mongoUrl: "mongodb://localhost:27017/seko"}),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))



// setting response headers
app.use((req, res, next)=> {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
})

const AuthRoutes = require("./routes/auth-routes");
const UserRoutes = require("./routes/user-routes");
app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);



// if no requested page is found, hits this response
app.use((req, res, next)=> {
    return next(new HttpError("Page dosent exist!", 404));
})

app.use((error, req, res, next)=> {
        if (res.headersSent) {
            return next(error)
        }
        console.log(error.message)
        res.status(error.code || 500).json({message: error.message || "Some unknown error happend!", status: error.code || 500});
})


mongoose.connect('mongodb://localhost:27017/seko', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,})
.then( ()=> {
    httpServer.listen(port, ()=> {
        console.log("App startet on port " + port)
    })
})
.catch((err) => {
    console.log(err)
});

