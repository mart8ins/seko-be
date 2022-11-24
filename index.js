require("dotenv").config();
// const path = require("path");

const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
global.io = require("socket.io")(httpServer, { cors: { origin: "*" } });
require("./socket")();

const port = process.env.PORT || 3002;
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const HttpError = require("./errors/HttpError");

app.use(express.urlencoded({ extended: true }), express.json());
// app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use(cors());
app.use(
    session({
        secret: `${process.env.SESSION_SECRET}`,
        store: MongoStore.create({
            mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cv.clznt.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
        }),
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
    })
);

// setting response headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});

const AuthRoutes = require("./routes/auth-routes");
const ConnectionsRoutes = require("./routes/connections-routes");
const MessagesRoutes = require("./routes/messages-routes");
const ProfileRoutes = require("./routes/profile-routes");
const StoryRoutes = require("./routes/story-routes");
const WorkoutRoutes = require("./routes/workout-routes");
const ContentFeedRoutes = require("./routes/contentFeed-routes");

app.use("/api/auth", AuthRoutes);
app.use("/api/connections", ConnectionsRoutes);
app.use("/api", MessagesRoutes);
app.use("/api/profile", ProfileRoutes);
app.use("/api/story", StoryRoutes);
app.use("/api/workout", WorkoutRoutes);
app.use("/api/contentFeed", ContentFeedRoutes);

// if no requested page is found, hits this response
app.use((req, res, next) => {
    return next(new HttpError("Page dosent exist!", 404));
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    console.log(error.message);
    res.status(error.code || 500).json({ message: error.message || "Some unknown error happend!", status: error.code || 500 });
});

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cv.clznt.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
    )
    .then(() => {
        httpServer.listen(port, () => {
            console.log("App startet on port " + port);
        });
    })
    .catch((err) => {
        console.log(err);
    });
