import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdefghijklmno", 11);
const client = require("../config/database");

router.post("/savedpost/:id", async (req: Request, res: Response) => {
  await client.connect();
  const post_id = req.params.id;
  const sessionid = req.session.sessionId;
  if (!sessionid) {
    res.json({ error: "Please Login To Use This Feature" });
  } else {
    client.query("BEGIN");
    //check sessionid in db
    const sessionquery = "SELECT userid FROM users WHERE sessionid = $1";
    const result = await client.query(sessionquery, [sessionid]);
    const user_id = result.rows[0].userid;
    //check if post exist
    const checkifpostexist = await client.query(
      "SELECT * FROM post WHERE post_id = $1",
      [post_id]
    );
    if (checkifpostexist.rowCount === 0) {
      res.json({ error: "Post Not Found" });
    } else {
      //check if post is already saved
      const checkquery =
        "SELECT * FROM savedpost WHERE userid = $1 AND postid = $2";
      const checkifexist = await client.query(checkquery, [user_id, post_id]);
      if (checkifexist.rowCount === 0) {
        //chechquery = true
        const addquery = "INSERT INTO savedpost(userid,postid)VALUES($1,$2)";
        const addsaved = await client.query(addquery, [user_id, post_id]);
        await res.json({ sucess: "Post saved" });
        await client.query("COMMIT");
        await client.end;
      } else {
        await client.query("ROLLBACK");
        res.json({ error: "Post already saved!" });
        await client.end;
      }
    }
  }
});

router.get("/savedpost", async (req: Request, res: Response) => {
  await client.connect();
  const sessionid = req.session.sessionId;
  //check if sessionid is present
  if (!sessionid) {
    res.json({ error: "Please Login To Use This Feature" });
  } else {
    client.query("BEGIN");
    const result = await client.query(
      "SELECT userid FROM users WHERE sessionid = $1",
      [sessionid]
    );
    const user_id = result.rows[0].userid;
    console.log(user_id);
    const query =
      "SELECT * FROM post JOIN savedpost ON post.post_id = savedpost.postid WHERE savedpost.userid = $1";
    const savedpost = await client.query(query, [user_id]);
    await res.json(savedpost.rows);
    await client.query("COMMIT");
  }
});

module.exports = router;
