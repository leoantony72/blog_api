"use strict";
exports.__esModule = true;
exports.createApp = void 0;
var express_1 = require("express");
var express_session_1 = require("express-session");
var authvalidation_1 = require("./middleware/authvalidation");
var auth_1 = require("./middleware/auth");
var cors_1 = require("cors");
var morgan_1 = require("morgan");
require("dotenv").config();
var client = require("./config/database");
var pgSession = require("connect-pg-simple")(express_session_1["default"]);
var getposts = require("./api-routes/getpost");
var newpost = require("./api-routes/admin/newPost");
var postFunction = require("./api-routes/admin/postFunctions");
var login = require("./api-routes/login");
var search = require("./api-routes/search");
var savepost = require("./api-routes/savedPost");
var errhandler = require("./api-routes/err handler/sessiontimout");
var verifyemail = require("./api-routes/verifyemail");
var createApp = function () {
    var app = express_1["default"]();
    app.use(cors_1["default"]());
    app.use(express_1["default"].json());
    app.use(express_1["default"].urlencoded({ extended: true }));
    app.use(morgan_1["default"]("dev"));
    app.use("/images", express_1["default"].static("images/post_banner"));
    var secret = process.env.SESSION_SECRET;
    app.use(express_session_1["default"]({
        store: new pgSession({
            pool: client,
            tableName: "sessiond",
            pruneSessionInterval: 15
        }),
        secret: secret,
        name: "SESSION",
        resave: false,
        saveUninitialized: false,
        cookie: {
            path: "/",
            maxAge: 3600000 * 60 * 10,
            httpOnly: true,
            secure: false
        }
    }));
    app.use(auth_1.active);
    app.use("/api/err", errhandler);
    app.use("/api/admin", authvalidation_1.Adminvalidate, newpost, postFunction);
    app.use("/api/auth", login);
    app.use("/api", getposts);
    app.use("/api", search);
    app.use("/api", verifyemail);
    app.use("/api", authvalidation_1.validateUsers, savepost);
    app.use(function (err, req, res, next) {
        if (err.status === 401) {
            return res.status(401).json({ error: err.message });
        }
        if (err.status === 403) {
            return res.status(403).json({ error: err.message });
        }
        if (err.status === 404) {
            return res.status(404).json({ error: "Not Found" });
        }
        next();
    });
    app.get("/", function (req, res) {
        if (req.session.newsession) {
            res.send("" + req.session.userid);
        }
        else {
            res.send("no sess");
        }
    });
    /*app.get("*", function (req, res) {
      res.status(404).send("what???");
    });*/
    return app;
};
exports.createApp = createApp;
