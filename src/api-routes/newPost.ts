import express, { Request, Response } from "express";
const router = express.Router();
const path = require("path");
const fs = require("fs");

//db import
const client = require("../config/database");

//multer import
const { upload } = require("../config/multer");

//id generator nanoid
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("abcdefghijklmnopkrst", 11);

//deleting file
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

router.post(
  "/api/upload",
  upload.single("image"),
  async (req: Request, res: Response) => {
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    try {
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
      const id = nanoid();
      const img = req.file.filename;
      client.query("BEGIN");
      const now = new Date();
      const query =
        "INSERT INTO post (post_id,title,meta_title,slug,summary,content,published,publishedAt,author_id,image)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING post_id";
      const newpost = await client.query(query, [
        id,
        post_title,
        post_meta_title,
        post_slug,
        post_summary,
        post_content,
        post_published,
        now,
        author_id,
        img,
      ]);

      const newcat = await client.query(
        "INSERT INTO post_category(post_id,category_id)VALUES($1,$2)",
        [newpost.rows[0].post_id, category_id]
      );
      client.query("COMMIT");
      res.json(newpost.rows[0]);
    } catch (error) {
      await unlinkAsync(req.file.path);
      client.query("ROLLBACK");
      res.status(400);
      res.json(error);
    } finally {
      client.end;
    }
  }
);

module.exports = router;
