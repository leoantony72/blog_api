import express, { NextFunction, Request, Response } from "express";
import session, { Store } from "express-session";
import { validateUsers, Adminvalidate } from "./middleware/authvalidation";
import { active } from "./middleware/auth";
import cors from "cors";
import morgan from "morgan";
require("dotenv").config();
const client = require("./config/database");
const pgSession = require("connect-pg-simple")(session);
const getposts = require("./api-routes/getpost");
const newpost = require("./api-routes/admin/newPost");
const postFunction = require("./api-routes/admin/postFunctions");
const login = require("./api-routes/login");
const search = require("./api-routes/search");
const savepost = require("./api-routes/savedPost");
const errhandler = require("./api-routes/err handler/sessiontimout");
const verifyemail = require("./api-routes/verifyemail");

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use("/images", express.static("images/post_banner"));
  const secret: string = process.env.SESSION_SECRET!;
  app.use(
    session({
      store: new pgSession({
        pool: client,
        tableName: "sessiond",
        pruneSessionInterval: 15,
      }),
      secret: secret,
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

  app.use(active);
  app.use("/api/err", errhandler);
  app.use("/api/admin", Adminvalidate, newpost, postFunction);
  app.use("/api/auth", login);
  app.use("/api", getposts);
  app.use("/api", search);
  app.use("/api", verifyemail);
  app.use("/api", validateUsers, savepost);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

  app.get("/", (req: Request, res: Response) => {
    if (req.session.newsession) {
      res.send(`${req.session.userid}`);
    } else {
      res.send("no sess");
    }
  });

  /*app.get("*", function (req, res) {
    res.status(404).send("what???");
  });*/

  return app;
};
