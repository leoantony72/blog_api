import express, { Request, Response } from "express";
const router = express.Router();

router.get("/api/sessiontimout", (req: Request, res: Response) => {
  console.log(req.session);

  res.json({ error: "You have Been Logged Out, Please Login Again" });
});

module.exports = router;
