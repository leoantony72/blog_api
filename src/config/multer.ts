import { Request, Response, NextFunction } from "express";
import multer from "multer";
const path = require("path");

var storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    cb(null, `./images/post_banner`);
  },
  filename: (req: Request, file: any, cb: any) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = async (req: Request, file: any, cb: any) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

module.exports = {
  upload: upload,
};
