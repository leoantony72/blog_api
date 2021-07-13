import express, { Request, Response } from "express";
const app = express();
const cors = require("cors");
const getposts = require("./api-routes/getpost");
const newpost = require("./api-routes/newPost");
const path = require("path");
const postFunction = require("./api-routes/postFunctions");

const morgan = require("morgan");
//...
//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/images", express.static("./images/post_banner"));

app.use(getposts);
app.use(newpost);
app.use(postFunction);

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

//App Listen
app.listen(3500, () => {
  console.log("server started ");
});
