import express, { Request, Response } from "express";
const router = express.Router();
import crypto from "crypto";
const bcrypt = require("bcrypt");
const client = require("../config/database");

declare module "express-session" {
  interface SessionData {
    sessionId: any;
  }
}

//Register user
router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  //check if user exist
  await client.connect();
  const sql = "SELECT username FROM users WHERE username = $1";
  const result = await client.query(sql, [req.body.username]);
  //success, user is not there create it
  if (result.rowCount === 0) {
    //the hash has the salt
    const hash = await bcrypt.hash(req.body.password, 10);
    //store user, password and role
    await client.query(
      "INSERT INTO users (username, passwordhash)VALUES($1,$2)",
      [req.body.username, hash]
    );
    res.send({ success: "User created successfully" });
  } else res.send({ error: "User already exists.." });
});

//login user
router.post("/login", async (req: Request, res: Response) => {
  await client.connect();
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [req.body.username]);

    if (result.rowCount === 0) {
      res.send({ error: "Incorrect username or password" });
    } else {
      const saltedPassword = result.rows[0].passwordhash;
      const successResult = await bcrypt.compare(
        req.body.password,
        saltedPassword
      );
      if (successResult === true) {
        //generate new session id
        const sessionId = await randomString();
        //update the table with the new session id
        const sql = "update users set sessionid = $1 where username = $2";
        const result = await client.query(sql, [sessionId, req.body.username]);
        req.session.sessionId = sessionId;
        res.send({ success: "Logged in successfully!" });
      } else {
        res.send({ error: "Incorrect username or password" });
      }
    }
  } catch (ex) {
    console.log(ex);
  }
});

//logout user

router.post("/logout", async (req, res) => {
  //logging out
  const sessionId = req.session.sessionId;
  if (sessionId) {
    const sql = "UPDATE users SET sessionid = null WHERE sessionid = $1";
    const result = await client.query(sql, [sessionId]);

    res.send({ success: "logged out successfully" });
  } else {
    res.send({ success: "You haven't logged In!" });
  }
});

module.exports = router;

async function randomString() {
  return crypto.randomBytes(64).toString("hex");
}
function sha256(txt: any) {
  const secret = "79wf7kpo439b1a6dbdfjyfgm";
  const hash = crypto.createHmac("sha256", secret).update(txt).digest("hex");
  return hash;
}
