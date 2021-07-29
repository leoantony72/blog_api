import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdef", 11);

export function generateid() {
  const id = nanoid();
  return id;
}

