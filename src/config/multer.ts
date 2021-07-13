import { Request, Response, NextFunction } from "express";
import multer from "multer";
const path = require("path");

var storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    cb(null, `./images/post_banner`, false);
  },
  filename: (req: Request, file: any, cb: any) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 },
}).single("image");

/*let fileFilter = function (req:Request, file:any, cb:any) {
  var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png'];
  if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
  } else {
      cb({
          success: false,
          code:'LIMIT_FILE_SIZE',
          message: 'Invalid file type. Only jpg, png image files are allowed.'
      }, false);
  }
};*/

/*const upload = multer({
  storage:storage ,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});/*/

module.exports = {
  upload: upload,
};
