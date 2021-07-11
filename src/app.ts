import express, { Request, Response } from "express";
const app = express();
const cors = require("cors");
const getposts = require("./api-routes/getpost");
const newpost = require("./api-routes/newPost");
const postFunction = require("./api-routes/postFunctions")

const morgan = require("morgan");

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use(getposts);
app.use(newpost);
app.use(postFunction);

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

//App Listen
app.listen(3200, () => {
  console.log("server started ");
});
