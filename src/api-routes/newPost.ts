import express, { Request, Response } from "express";
import { generateid } from "../controller/generateid";
const router = express.Router();
const path = require("path");
const fs = require("fs");
const client = require("../config/database");
const { upload } = require("../config/multer");

//deleting file
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

router.post("/upload", async (req: Request, res: Response) => {
  await upload(req, res, async (error: any) => {
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
      const id = generateid();
      const img = req.file?.filename;
      client.query("BEGIN");
      const now = new Date();
      const query =
        "INSERT INTO post (post_id,title,meta_title,slug,summary,content,published,publishedAt,author_id,image)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING post_id";

      const values = [
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
      ];
      const newpost = await client.query(query, values);

      const newcat = await client.query(
        "INSERT INTO post_category(post_id,category_id)VALUES($1,$2)",
        [newpost.rows[0].post_id, category_id]
      );
      client.query("COMMIT");
      res.json(newpost.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      if (req.file == undefined) {
        return res
          .status(400)
          .send({ message: "Please upload a .png/.jpg/.jpeg file below 5mb" });
      } else {
        unlinkAsync(req.file?.path);
      }
      res.status(400);
      res.json({
        err: err,
        error: error,
      });
    }
  });
});

module.exports = router;
