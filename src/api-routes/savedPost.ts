import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdefghijklmno", 11);
const client = require("../config/database");

//save a post
router.post("/savedpost/:id", async (req: Request, res: Response) => {
  const post_id = req.params.id;
  const sessionid = req.session.newsession;
  const userid = req.session.userid;
  if (!sessionid) {
    res.json({ error: "Please Login To Use This Feature" });
  } else {
    client.query("BEGIN");
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
      const checkifexist = await client.query(checkquery, [userid, post_id]);
      if (checkifexist.rowCount === 0) {
        //chechquery = true
        const addquery = "INSERT INTO savedpost(userid,postid)VALUES($1,$2)";
        const addsaved = await client.query(addquery, [userid, post_id]);
        res.json({ sucess: "Post saved" });
        await client.query("COMMIT");

      } else {
        await client.query("ROLLBACK");
        res.json({ error: "Post already saved!" });

      }
    }
  }
});
//delete savedpost
router.delete("/savedpost/:id", async (req: Request, res: Response) => {
  const post_id = req.params.id;
  const sessionid = req.session.newsession;
  const userid = req.session.userid;
  if (!sessionid) {
    res.json({ error: "Please Login To Use This Feature" });
  } else {
    client.query("BEGIN");
    //check if post exist
    const checkifpostexist = await client.query(
      "SELECT post_id,title FROM post WHERE post_id = $1",
      [post_id]
    );
    if (checkifpostexist.rowCount === 0) {
      res.json({ error: "Post Not Found" });
      await client.query("ROLLBACK");
    } else {
      //check if post is saved
      const checkquery =
        "SELECT * FROM savedpost WHERE userid = $1 AND postid = $2";
      const checkifexist = await client.query(checkquery, [userid, post_id]);
      if (checkifexist.rowCount === 0) {
        res.json({ error: "Post Not Saved" });
        await client.query("ROLLBACK");
      } else {
        const delquery =
          "DELETE FROM savedpost WHERE userid = $1 AND postid = $2";
        const delsavedpost = await client.query(delquery, [userid, post_id]);
        await res.json({ success: "Post Deleted" });
        await client.query("COMMIT");

      }
    }
  }
});
//Get savedpost
router.get("/savedpost", async (req: Request, res: Response) => {
  const sessionid = req.session.newsession;
  const userid = req.session.userid;
  //check if sessionid is present
  if (!sessionid) {
    res.json({ error: "Please Login To Use This Feature" });

  } else {
    client.query("BEGIN");
    const result = await client.query(
      "SELECT userid FROM users WHERE userid = $1",
      [userid]
    );
    const query =
      "SELECT * FROM post JOIN savedpost ON post.post_id = savedpost.postid WHERE savedpost.userid = $1";
    const savedpost = await client.query(query, [userid]);
    if (savedpost.rowCount === 0) {
      res.json({ error: "No Post Saved" });

    } else {
      await res.json(savedpost.rows);
      await client.query("COMMIT");

    }
  }
});

module.exports = router;
