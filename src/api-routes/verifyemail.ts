import express, { Request, Response } from "express";
const router = express.Router();
const client = require("../config/database");
import jwt from "jsonwebtoken";

const JWT_SECRET = "{8367E87C-B794-4A04-89DD-15FE7FDBFF78}";
router.get("/verify/", async (req: Request, res: Response) => {
  const token = req.query.vif;
  if (token) {
    const check = await client.query(
      "SELECT userid,expiry FROM users WHERE token = $1",
      [token]
    );
    const now = Date.now();
    console.log(now - 1800000);
    if (check.rowCount !== 0) {
      const expiredate = check.rows[0].expiry;
      if (now > expiredate) {
        const deltoken = await client.query(
          "UPDATE users SET token = null,expiry = null WHERE token = $1",
          [token]
        );
        return res
          .status(400)
          .json({ error: "Invalid Token Or Have Been Expired" });
      }
      const isactive = true;
      const update = await client.query(
        "UPDATE users SET isactive = $1 WHERE token = $2",
        [isactive, token]
      );
      const deltoken = await client.query(
        "UPDATE users SET token = null,expiry = null WHERE token = $1",
        [token]
      );
      res.status(200).json({ success: "You Have Been Verified" });
    } else {
      res.status(400).json({ error: "Invalid Token Or Have Been Expired" });
    }
  } else {
    res.status(400).json({ error: "Invalid Token Or Have Been Expired" });
  }
});

module.exports = router;
