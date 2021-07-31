import express, { Request, Response } from "express";
const app = express();
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
const getposts = require("./api-routes/getpost");
const newpost = require("./api-routes/newPost");
const postFunction = require("./api-routes/postFunctions");
const login = require("./api-routes/login");
const search = require("./api-routes/search");
const savepost = require("./api-routes/savedPost");
import { validateUsers, Adminvalidate } from "./middleware/validation";
import { active } from "./middleware/auth";
const errhandler = require("./api-routes/err handler/sessiontimout");
const pool = require("./config/database");
const pgSession = require("connect-pg-simple")(session);


//...
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/images", express.static("./images/post_banner"));
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "sessiond",
      pruneSessionInterval: 15,
    }),
    secret: "790e382439b1a8b6db2c0547bd819f1d83e23e",
    name: "SESSION",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      maxAge: 3600000 * 60 * 10,
      httpOnly: true,
      secure: false,
    },
  })
);

//routes
app.use(active);
app.use("/api/err", errhandler);
app.use("/api/admin", Adminvalidate, newpost, postFunction);
app.use("/api/auth", login);
app.use("/api", getposts);
app.use("/api", search);
app.use("/api", savepost);

app.get("/", (req: Request, res: Response) => {

  if (req.session.newsession) {
    res.send(`${req.session.userid}`);
  } else {
    res.send("no sess");
  }
});

app.get("*", function (req, res) {
  res.status(404).send("what???");
});

//App Listen
app.listen(3300, () => {
  console.log("server started ");
});
