import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import crypto from "crypto";
const bcrypt = require("bcrypt");
const client = require("../config/database");
import { active } from "../middleware/auth";
import { generateid } from "../controller/generateid";
const { validation } = require("../middleware/validation");

router.post("/register", validation, async (req: Request, res: Response) => {
  const { username, email, password, confirmpassword } = req.body;
  //check if password === confirmpassword
  if (password !== confirmpassword) {
    return res.status(400).json({ error: "Password not same" });
  }

  await client.query("BEGIN");
  //check if email already exist
  const checkemail = await client.query(
    "SELECT email FROM users WHERE email = $1",
    [email]
  );
  if (checkemail.rowCount !== 0) {
    return res.status(400).json({ error: "email is already taken" });
  }
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
      "INSERT INTO users(userid,username, passwordhash,registeredat,email)VALUES($1,$2,$3,$4,$5)";
    const reg = await client.query(query, [
      id,
      req.body.username,
      hash,
      date,
      email,
    ]);
    await client.query("COMMIT");
    res.send({ success: "User created successfully" });
  } else {
    await client.query("ROLLBACK");
    res.send({ error: "User already exists.." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  //check if session.newsession is present
  if (!req.session.newsession) {
    await client.query("BEGIN");
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [req.body.username]);
    if (result.rowCount != 0) {
      const saltedPassword = result.rows[0].passwordhash;
      const successResult = await bcrypt.compare(
        req.body.password,
        saltedPassword
      );
      if (successResult === true) {
        const session = await randomString();
        req.session.newsession = session;
        req.session.userid = result.rows[0].userid;
        req.session.createdAt = Date.now();
        await client.query("COMMIT");
        res.send({ success: "Logged in successfully!" });
      }
    } else {
      await client.query("ROLLBACK");
      res.json({ error: "user don't exist" });
    }
  } else {
    await client.query("ROLLBACK");
    res.json({ sucess: "You Are Already Logged In" });
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
