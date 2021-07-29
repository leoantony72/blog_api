import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

//check if logged In
export function isLoggedIn(req: Request) {
  if (req.session.newsession) return true;
  else return false;
}

//Logout function
async function logOut(req: Request, res: Response) {
  // destroy user session
  req.session.destroy((err) => {
    // if err, then return to Home page
    if (err) return res.redirect("/");

    // clear out cookies
    res.clearCookie("SESSION");

    // return to Login page
    return res.redirect("/api/sessiontimout");
  });
}

//check if session is expired
export async function active(req: Request, res: Response, next: NextFunction) {
  // check if user isloggedIn
  if (isLoggedIn(req) === true) {
    // get time stamp NOW
    const now = Date.now();
    const fivemin = 1000 * 60 * 5;
    console.log("this one ", Date.now() - 1000 * 60 * 5);
    // get time stamp BEFORE (the one created once the user loggedIn)
    const { createdAt } = req.session;

    // check if user already exceed (active/non-active) time in the system
    if (now > createdAt + fivemin) {
      return await logOut(req, res);
    }
  }

  next();
}
