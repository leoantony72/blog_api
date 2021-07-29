import express, { Request, Response } from "express";
const router = express.Router();
import crypto from "crypto";
const bcrypt = require("bcrypt");
const client = require("../config/database");
import { active } from "../middleware/auth";
import { generateid } from "../controller/generateid";

router.post("/register", async (req: Request, res: Response) => {
  await client.query("BEGIN");
  const { username, password } = req.body;
  //check if user exist
  const sql = "SELECT username FROM users WHERE username = $1 FOR UPDATE";
  const result = await client.query(sql, [username]);
  //success, user is not there create it
  if (result.rowCount === 0) {
    //the hash has the salt
    const hash = await bcrypt.hash(password, 10);
    //store user, password and role
    const id = generateid();
    const date = new Date();
    const query =
      "INSERT INTO users(userid,username, passwordhash,registeredat)VALUES($1,$2,$3,$4)";
    const reg = await client.query(query, [id, req.body.username, hash, date]);
    res.send({ success: "User created successfully" });
    await client.query("COMMIT");
  } else {
    await client.query("ROLLBACK");
    res.send({ error: "User already exists.." });
  }
});

router.post("/login", active, async (req: Request, res: Response) => {
  if (!req.session.newsession) {
    await client.query("BEGIN");
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [req.body.username]);

    if (result.rowCount === 0) {
      res.send({ error: "Incorrect username or password" });
      await client.query("ROLLBACK");
    } else {
      const saltedPassword = result.rows[0].passwordhash;
      const successResult = await bcrypt.compare(
        req.body.password,
        saltedPassword
      );
      if (successResult === true) {
        //generate new session id
        const sessionId = await randomString();
        req.session.newsession = sessionId;
        req.session.userid = result.rows[0].userid;
        req.session.createdAt = Date.now();
        res.send({ success: "Logged in successfully!" });
        await client.query("COMMIT");
      } else {
        await client.query("ROLLBACK");
        res.send({ error: "Incorrect username or password" });
      }
    }
  } else {
    await client.query("ROLLBACK");
    res.json({ success: "You are alredy logged In" });
  }
});

//logout user

router.post("/logout", async (req, res) => {
  //logging out
  const sessionId = req.session.newsession;
  if (!sessionId) {
    res.send({ success: "You Are Not Logged In" });
  } else {
    req.session.destroy((err) => {
      res.clearCookie("SESSION");
      res.json({ sucess: "You have successfully Logged Out" });
    });
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
