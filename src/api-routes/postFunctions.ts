import express, { Request, Response } from "express";
const router = express.Router();
const path = require("path");
const fs = require("fs");
const client = require("../config/database");
const { promisify } = require("util");
const { upload } = require("../config/multer");
const unlinkAsync = promisify(fs.unlink);

router.put("/api/post/:id", async (req: Request, res: Response) => {
  await client.connect();
  console.log(req.file)
  await upload(req, res, async (error: any) => {
    try {
      await client.query("BEGIN");
      const { id } = req.params;
      const {
        post_title,
        post_meta_title,
        post_slug,
        post_summary,
        post_content,
        post_published,
        author_id,
        category_id,
      } = req.body;

      const initialimg = await client.query(
        "SELECT image FROM post WHERE post_id = $1",
        [id]
      );

      //get current img name
      const imgdel = initialimg.rows?.[0].image;
      console.log(imgdel);
      const img = req.file?.filename;
      console.log(img)

      const query =
        "UPDATE post SET title = $1,meta_title = $2,slug = $3,summary = $4,content = $5,published = $6,author_id = $7,image = $8 WHERE post_id = $9";

      const updatepost = await client.query(query, [
        post_title,
        post_meta_title,
        post_slug,
        post_summary,
        post_content,
        post_published,
        author_id,
        img,
        id,
      ]);

      const category =
        "UPDATE post_category SET category_id = $1 WHERE post_id = $2";
      const updatcategory = await client.query(category, [category_id, id]);

      await client.query("COMMIT");

      const currentimg = await client.query(
        "SELECT image FROM post WHERE post_id = $1",
        [id]
      );

      res.json("post updated");

      if (initialimg === currentimg) {
        res.json("img is same");
      } else {
        unlinkAsync("images/post_banner/" + imgdel);
      }
    } catch (err) {
      await client.query("ROLLBACK");
      await unlinkAsync(req.file?.path);
      res.status(400);
      res.json({
        err:err,
        error:error
      });
    } finally {
      client.end;
    }
  });
});

//
//
//
//delete a post
router.delete("/api/post/:id", async (req: Request, res: Response) => {
  await client.connect();
  try {
    await client.query("BEGIN");
    const { id } = req.params;
    const imgquery = await client.query("SELECT image FROM post WHERE post_id = $1",[id]);
    const img = imgquery.rows?.[0].image;
    console.log(img);
    const query = "DELETE FROM post WHERE post_id = $1";
    const deletePost = await client.query(query, [id]);
    await client.query("COMMIT");
    await unlinkAsync("images/post_banner/" + img);
    res.json("post deleted");
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400);
    res.json(err);
  } finally {
    client.end;
  }
});

module.exports = router;
