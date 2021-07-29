import express, { Request, Response } from "express";
const router = express.Router();
const client = require("../config/database");

router.get("/search/:query", async (req: Request, res: Response) => {
  const searchtext = req.params.query;
  const search = await client.query(
    `SELECT * FROM post WHERE title LIKE '%'||$1||'%' OR meta_title LIKE '%'||$2||'%' `,
    [searchtext, searchtext]
  );
  if (search.rowCount === 0) {
    res.status(400).send({ message: "not found" });
  } else {
    await res.json(search.rows);
  }
});

module.exports = router;
