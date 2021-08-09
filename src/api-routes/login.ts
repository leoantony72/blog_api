import express, { NextFunction, Request, response, Response } from "express";
const router = express.Router();
import crypto from "crypto";
const bcrypt = require("bcrypt");
const client = require("../config/database");
import { generateid } from "../controller/generateid";
const { validation } = require("../middleware/validation");
import nodemailer from "nodemailer";

const JWT_SECRET = "{8367E87C-B794-4A04-89DD-15FE7FDBFF78}";
const JWT_REFRESH_SECRET = "{asdfasdfdsfa-B794-4A04-89DD-15FE7FDBFF78}";

router.post("/register", validation, async (req: Request, res: Response) => {
  const { username, email, password, confirmpassword } = req.body;
  if (password !== confirmpassword) {
    return res.status(400).json({ error: "Password not same" });
  }

  const checkemail = await client.query(
    "SELECT isactive FROM users WHERE email = $1",
    [email]
  );

  if (checkemail.rowCount === 0) {
    const sql = "SELECT username FROM users WHERE username = $1 FOR UPDATE";
    const result = await client.query(sql, [username]);
    //success, user is not there create it
    if (result.rowCount === 0) {
      //the hash has the salt
      const hash = await bcrypt.hash(password, 10);
      //store user, password and role
      const id = generateid();
      const date = new Date();

      var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      const token = await randomString();
      console.log(token);
      const expiry = +new Date() + 1800000;
      const query =
        "INSERT INTO users(userid,username, passwordhash,registeredat,email,token,expiry)VALUES($1,$2,$3,$4,$5,$6,$7)";
      const reg = await client.query(query, [
        id,
        username,
        hash,
        date,
        email,
        token,
        expiry,
      ]);
      await client.query("COMMIT");
      res.send({ success: "User created successfully" });
      const link = "http://localhost:3300/api/verify/?vif=" + token;
      const mailOptions: {
        from: string;
        to: string;
        subject: string;
        html: any;
      } = {
        from: "apiblogbackend@gmail.com",
        to: email,
        subject: "Please confirm your Email account",
        html: `<html>
        <head>
          <style type="text/css">
            body, p, div {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 14px;
            }
            a {
              text-decoration: none;
            }
          </style>
          <title></title>
        </head>
        <body>
        <center>
          <p><a href=${link}>Click Here To Verify Your Email</a></p>
        </center>
        </body>
      </html></a>`,
      };
      smtpTransport.sendMail(mailOptions, function (error: any, response: any) {
        if (error) {
          console.log(error);
          res.end("error");
        } else {
          res.send({ success: "User created successfully" });
        }
      });
    } else {
      res.json("Username Taken");
    }
  } else {
    res.json("taken");
  }
});


/*router.post("/register", validation, async (req: Request, res: Response) => {
  const { username, email, password, confirmpassword } = req.body;
  //check if password === confirmpassword
  if (password !== confirmpassword) {
    return res.status(400).json({ error: "Password not same" });
  }
  await client.query("BEGIN");
  //check if email already exist
  const checkemail = await client.query(
    "SELECT username FROM users WHERE email = $1",
    [email]
  );
  console.log(checkemail);

  if (checkemail.rowCount === 0) {
    const deleteemail = await client.query(
      "DELETE FROM users WHERE email = $1",
      [email]
    );
    
    const sql = "SELECT username FROM users WHERE username = $1 FOR UPDATE";
    const result = await client.query(sql, [username]);
    //success, user is not there create it
    if (result.rowCount === 0) {
      //the hash has the salt
      const hash = await bcrypt.hash(password, 10);
      //store user, password and role
      const id = generateid();
      const date = new Date();

      var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      const token = await randomString();
      console.log(token);
      const expiry = +new Date() + 1800000;
      console.log(Date.now() - 1800000);
      const query =
        "INSERT INTO users(userid,username, passwordhash,registeredat,email,token,expiry)VALUES($1,$2,$3,$4,$5,$6,$7)";
      const reg = await client.query(query, [
        id,
        req.body.username,
        hash,
        date,
        email,
        token,
        expiry,
      ]);
      await client.query("COMMIT");
      res.send({ success: "User created successfully" });
      const link = "http://localhost:3300/api/verify/?vif=" + token;
      const mailOptions: {
        from: string;
        to: string;
        subject: string;
        html: any;
      } = {
        from: "apiblogbackend@gmail.com",
        to: req.body.email,
        subject: "Please confirm your Email account",
        html: `<html>
        <head>
          <style type="text/css">
            body, p, div {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 14px;
            }
            a {
              text-decoration: none;
            }
          </style>
          <title></title>
        </head>
        <body>
        <center>
          <p><a href=${link}>Click Here To Verify Your Email</a></p>
        </center>
        </body>
      </html></a>`,
      };
      smtpTransport.sendMail(mailOptions, function (error: any, response: any) {
        if (error) {
          console.log(error);
          res.end("error");
        } else {
          res.send({ success: "User created successfully" });
        }
      });
    } else {
      await client.query("ROLLBACK");
      res.send({ error: "User already exists.." });
    }
  } else {
    res.send({ error: "User already exists!!.." });
  }
});*/

//Login Route
router.post("/login", async (req: Request, res: Response) => {
  //check if session.newsession is present
  if (!req.session.newsession) {
    await client.query("BEGIN");
    const query =
      "SELECT username,passwordhash,isactive FROM users WHERE username = $1";
    const result = await client.query(query, [req.body.username]);

    if (result.rowCount != 0) {
      if (result.rows[0].isactive === false) {
        return res.status(400).json({ error: "Please Verify Your Eamil" });
      }
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
