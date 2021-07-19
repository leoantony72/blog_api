import express, { Request, Response, NextFunction } from "express";
const client = require("../config/database");

export async function Adminvalidate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sess = req.session.sessionId;

  const query = "SELECT * FROM users WHERE sessionid = $1";
  const result = await client.query(query, [sess]);

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

export async function validateUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sess = req.session.sessionId;

  const query = "SELECT * FROM users WHERE sessionid = $1";
  const result = await client.query(query, [sess]);
  if (result.rowCount === 0) {
    res.status(400).send({ error: "Please Login" });
  } else {
    if (result.rows[0].user_role === "USER" || "ADMIN") {
      next();
    } else {
      res.status(400).send({ error: "You Stepped In The Wrong Path" });
    }
  }
}
