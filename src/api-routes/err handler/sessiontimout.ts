import express, { Request, Response } from "express";
const router = express.Router();

router.get("/sessiontimout", (req: Request, res: Response) => {
  res.json({ error: "You have Been Logged Out, Please Login Again" });
});

module.exports = router;
