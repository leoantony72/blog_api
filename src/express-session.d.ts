import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    newsession: any;
    viewcount: any;
    userid: string;
    createdAt: any;
    test: any;
  }
}
