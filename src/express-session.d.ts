import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    newsession: string;
    viewcount: number;
    userid: string;
    createdAt: any;
  }
}
