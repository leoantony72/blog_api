const express = require("express");
const router = express.Router();
const path = require("path");
const client = require("../config/database");
const multer = require("multer");
const fs = require('fs');
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink);

//multer image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./images/post_banner`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = async (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});


router.post("/api/upload", upload.single("image"), async (req, res) => {
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
    const img = req.file.filename;
    client.query("BEGIN");
    const now = new Date();
    const query =
      "INSERT INTO post (title,meta_title,slug,summary,content,published,publishedAt,author_id,image)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING post_id";
    const newpost = await client.query(query, [
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
    res.json(error);
  }finally{
    await client.end;
  }
});

module.exports = router;
