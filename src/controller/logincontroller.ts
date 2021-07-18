import crypto from "crypto";
const client = require("../config/database");

export async function validateSession(sessionid: any) {
    const sql = "SELECT * FROM users WHERE sessionid = $1";
    const result = await client.query(sql, [sessionid]);
  
    //fail
    if (result.rowCount === 0) return null;
    else
      return {
        username: result.rows[0].username,
        role: result.rows[0].user_role,
      };
  }
  
  export async function randomString() {
    return crypto.randomBytes(64).toString("hex");
  }
  export function sha256(txt: any) {
    const secret = "abcdefg";
    const hash = crypto.createHmac("sha256", secret).update(txt).digest("hex");
    return hash;
  }
  