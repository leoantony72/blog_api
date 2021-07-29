import express, { Request, Response, NextFunction } from "express";
const client = require("../config/database");

export async function Adminvalidate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("admin");
  const sess = req.session.newsession;
  const userid = req.session.userid;
  if (!sess) {
    res.json({ error: "You Stepped In The Wrong Path" });
  } else {
    const query = "SELECT * FROM users WHERE userid = $1";
    const result = await client.query(query, [userid]);
    if (result.rowCount === 0) {
      res.status(400).send({ error: "You Stepped In The Wrong Path" });
    } else {
      if (result.rows[0].user_role === "ADMIN") {
        console.log("passed admin");
        next();
      } else {
        res.status(400).send({ error: "You Stepped In The Wrong Path" });
      }
    }
  }
}

export async function validateUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("user");
  const sess = req.session.newsession;
  const userid = req.session.userid;
  if (!req.session.newsession) {
    res.json({ error: "Please Login" });
  } else {
    const query = "SELECT * FROM users WHERE userid = $1";
    const result = await client.query(query, [userid]);
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
}
