import express, { Request, Response, NextFunction } from "express";
const client = require("../config/database");

export async function validateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sess = req.session.sessionId;

  const sql = "SELECT * FROM users WHERE sessionid = $1";
  const result = await client.query(sql, [sess]);

  //fail
  if (result.rowCount === 0) {
    res.status(400).send({ error: "You Stepped In The Wrong Path!!! " });
  } else {
    if (result.rows[0].user_role === "ADMIN") {
      next();
    } else {
      res.status(400).send({ error: "You Stepped In The Wrong Path" });
    }
  }
}
