import express, { Request, Response } from "express";
const router = express.Router();
const client = require("../config/database");


//Get all Post
router.get("/posts", async (req: Request, res: Response) => {
  await client.connect();
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
  } finally {
    client.end;
  }
});

//Get post by ID
router.get("/post/:id", async (req: Request, res: Response) => {
  await client.connect();
  try {
    await client.query("BEGIN");
    const { id } = req.params;
    const post = await client.query(
      "SELECT * FROM post JOIN authors ON post.author_id = authors.id JOIN post_category ON post_category.post_id = post.post_id JOIN category ON category.id = post_category.category_id WHERE post.post_id = $1",
      [id]
    );
    await client.query("COMMIT");
    res.json(post.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400);
    res.json(err);
  } finally {
    client.end;
  }
});

//GET POSTS IN A CATEGORY CATEGORY_TITLE)
router.get(
  "/posts/category/:category",
  async (req: Request, res: Response) => {
    await client.connect();
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
    } finally {
      client.end;
    }
  }
);

//Get post by author (ID)
router.get("/posts/author/:author", async (req: Request, res: Response) => {
  await client.connect();
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
  } finally {
    client.end;
  }
});

module.exports = router;
