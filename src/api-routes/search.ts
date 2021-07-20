import express, { Request, Response } from "express";
const router = express.Router();
const client = require("../config/database");

router.get("/search/:query", async (req: Request, res: Response) => {
  await client.connect();
  const searchtext = req.params.query;
  console.log(searchtext);
  const search = await client.query(
    `SELECT * FROM post WHERE title LIKE '%'||$1||'%' OR meta_title LIKE '%'||$2||'%' ` ,
    [searchtext,searchtext]
  );
  //console.log(search)
  if (search.rowCount === 0) {
    res.status(404);
    res.json({ error: `"${searchtext}" not found` });
  } else {
    await res.json(search.rows);
  }
});

module.exports = router;
/*
app.get("/search", function (req, res) {
  connection.query(
    'SELECT first_name from TABLE_NAME where first_name like "%' +
      req.query.key +
      '%"',
    function (err, rows, fields) {
      if (err) throw err;
      var data = [];
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].first_name);
      }
      res.end(JSON.stringify(data));
    }
  );
});*/
