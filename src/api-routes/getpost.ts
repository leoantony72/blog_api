import express, { Request, Response } from "express";
const router = express.Router();
const client = require("../config/database");

//Get all Post
router.get("/posts", async (req: Request, res: Response) => {
  try {
    await client.query("BEGIN");
    const query = "SELECT * FROM post ORDER BY post_id";
    const allPosts = await client.query(query);
    await client.query("COMMIT");
    res.json(allPosts.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400);
    res.json(err);
  }
});

//Get post by ID
router.get("/post/:id", async (req: Request, res: Response) => {
  try {
    await client.query("BEGIN");
    const id = req.params.id;
    const query =
      "SELECT po.post_id,po.title,po.meta_title,po.summary,po.slug,po.content,po.published,po.publishedat,po.image AS coverimg,ar.username AS author,cat.title AS category FROM post po JOIN authors ar ON po.author_id = ar.id JOIN post_category pc ON pc.post_id = po.post_id JOIN category cat ON cat.id = pc.category_id WHERE po.post_id = $1";
    const post = await client.query(query, [id]);
    await client.query("COMMIT");
    res.json(post.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400);
    res.json(err);
  }
});

//GET POSTS IN A CATEGORY CATEGORY_TITLE)
router.get("/posts/category/:category", async (req: Request, res: Response) => {
  try {
    await client.query("BEGIN");
    const { category } = req.params;
    const allPost = await client.query(
      "SELECT * FROM post JOIN authors ON post.author_id = authors.id JOIN post_category ON post_category.post_id = post.post_id JOIN category ON category.id = post_category.category_id WHERE category.title = $1",
      [category]
    );
    await client.query("COMMIT");
    res.json(allPost.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400);
    res.json(err);
  }
});

//Get post by author (ID)
router.get("/posts/author/:author", async (req: Request, res: Response) => {
  try {
    await client.query("BEGIN");
    const { author } = req.params;
    const query =
      "SELECT * FROM post JOIN authors ON post.author_id = authors.id JOIN post_category ON post_category.post_id = post.post_id JOIN category ON category.id = post_category.category_id WHERE authors.username = $1";
    const filterPost = await client.query(query, [author]);
    await client.query("COMMIT");
    res.json(filterPost.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400);
    res.json(err);
  }
});

module.exports = router;
