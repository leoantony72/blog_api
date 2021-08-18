import express, { NextFunction, Request, response, Response } from "express";
const router = express.Router();
import crypto from "crypto";
const bcrypt = require("bcrypt");
const client = require("../config/database");
import { generateid } from "../controller/generateid";
const {
  validation,
  Emailvalidation,
  Loginvalidation,
} = require("../middleware/registervalidation");
const {
  sendResetPassword,
  sendEmailVerification,
  sendLoginalert,
} = require("../controller/nodemailer");
import { check, validationResult } from "express-validator";
import session from "express-session";

//registers new user
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
      const token = await randomString();
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
      const sentemail = await sendEmailVerification(email, token);
    } else {
      await client.query("ROLLBACK");
      res.status(400).json("Username Taken");
    }
  } else {
    await client.query("ROLLBACK");
    res.status(400).json("Email Taken");
  }
});

//Login Route
router.post(
  "/login",
  [Loginvalidation],
  async (req: Request, res: Response) => {
    //check if session.newsession is present
    if (!req.session.newsession) {
      await client.query("BEGIN");
      const query =
        "SELECT username,passwordhash,isactive,email FROM users WHERE username = $1";
      const result = await client.query(query, [req.body.username]);

      if (result.rowCount != 0) {
        if (result.rows[0].isactive === false) {
          return res.status(400).json({ error: "Please Verify Your Eamil" });
        }
        const email = result.rows[0].email;
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
          await sendLoginalert(email);
        }
      } else {
        await client.query("ROLLBACK");
        res.json({ error: "user don't exist" });
      }
    } else {
      res.json({ sucess: "You Are Already Logged In" });
    }
  }
);
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

router.post(
  "/forgotpassword",
  [Emailvalidation],
  async (req: Request, res: Response) => {
    //get the email

    const email = req.body.email;
    await client.query("BEGIN");
    const checkemail = await client.query(
      "SELECT userid FROM users WHERE email = $1",
      [email]
    );
    const userid = checkemail.rows?.[0].userid;
    const checktokenisPresent = await client.query(
      "SELECT token FROM tokens WHERE users_id = $1",
      [userid]
    );
    if (checktokenisPresent.rowCount !== 0) {
      const oldtoken = checktokenisPresent.rows?.[0].token;
      const deltoken = await client.query(
        "DELETE FROM tokens WHERE users_id = $1",
        [userid]
      );
    }

    if (checkemail.rowCount === 0) {
      await client.query("ROLLBACK"); //fix this u shit
      return res.json({ success: "EMail sent !" });
    }
    const token = await randomString(); //create token
    const tokenhash = await bcrypt.hash(token, 9); //generate a hash
    const expiry = +new Date() + 600000; //expirty date
    const query = "INSERT INTO tokens(users_id,token,expiry)VALUES($1,$2,$3)"; //store token in db
    const reg = await client.query(query, [userid, tokenhash, expiry]);
    await client.query("COMMIT");
    res.send({ success: "Email sent" });
    const sent = await sendResetPassword(email, token, userid);
  }
);

//reset password verification & change password
router.post(
  "/reset-password/",
  [
    check(
      "password",
      "Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. "
    )
      .trim()
      .notEmpty()
      .withMessage("Password required")
      .isLength({ min: 8 })
      .withMessage("password must be minimum 8 length")
      .matches(/(?=.*?[a-z])/)
      .withMessage("At least one Lowercase")
      .matches(/(?=.*?[0-9])/)
      .withMessage("At least one Number")
      .matches(/(?=.*?[#!@$%^&*-])/)
      .withMessage("At least one special character")
      .not()
      .matches(/^$|\s+/)
      .withMessage("White space not allowed"),
  ],
  async (req: Request, res: Response) => {
    // get passwords
    const { password, confirmpassword, email } = req.body;
    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Password not same" });
    }
    const userid = req.query.id;
    const token = req.query.rec;

    const checkuser = await client.query(
      "SELECT token,expiry FROM tokens WHERE users_id = $1",
      [userid]
    );
    if (checkuser.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "Invalid Token Or Token Have Expired" });
    }

    const dbtoken = checkuser.rows[0].token;
    const successResult = await bcrypt.compare(token, dbtoken);
    if (successResult === false) {
      return res
        .status(400)
        .json({ error: "Invalid Token Or Token Have Expired" });
    }
    const hash = await bcrypt.hash(password, 10);
    const updatepass = await client.query(
      "UPDATE users SET passwordhash = $1 WHERE userid = $2",
      [hash, userid]
    );
    res.status(200).json({ success: "Password Have Been Updated" });

    const deletetoken = await client.query(
      "DELETE FROM tokens WHERE users_id = $1",
      [userid]
    ); //deletes the token after use
  }
);

module.exports = router;

async function randomString() {
  return crypto.randomBytes(64).toString("hex");
}
function sha256(txt: any) {
  const secret = "79wf7kpo439b1a6dbdfjyfgm";
  const hash = crypto.createHmac("sha256", secret).update(txt).digest("hex");
  return hash;
}
