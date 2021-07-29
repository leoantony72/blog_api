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
const errhandler = require("./api-routes/err handler/sessiontimout");
const client = require("./config/database");
const pgSession = require("connect-pg-simple")(session);

//...
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  session({
    secret: "790e382439b1a8b6db2c0547bd819f1d83e25ca3e",
    name: "SESSION",
    store: new pgSession({
      pool: client,
      tableName: "sessiond",
      pruneSessionInterval: 5,
    }),
    cookie: {
      maxAge: 1000 * 60 * 5,
      httpOnly: true,
      secure: false,
    },
    rolling: true,
    resave: false,
    saveUninitialized: false,
  })
);

//routes
app.use(errhandler);
app.use("/images", express.static("./images/post_banner"));
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
app.listen(3400, () => {
  console.log("server started ");
});
