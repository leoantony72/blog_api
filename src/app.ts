import express, { Request, Response } from "express";
const app = express();
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
const getposts = require("./api-routes/getpost");
const newpost = require("./api-routes/newPost");
const postFunction = require("./api-routes/postFunctions");
const login = require("./api-routes/login");
import { validateSession } from "./middleware/validation";

//...
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  session({
    name: "SESSION",
    resave: false,
    saveUninitialized: false,
    secret: "790e382439b1a8b6db2c0547bd819f1d83e25ca3e",
    cookie: {
      maxAge: 1000 * 60 * 5,
      httpOnly: true,
      secure: false,
    },
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

//routes
app.use("/images", express.static("./images/post_banner"));
app.use("/api/admin", validateSession, newpost, postFunction);
app.use("/api", login);
app.use("/api", getposts);

//App Listen
app.listen(3400, () => {
  console.log("server started ");
});
