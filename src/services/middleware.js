import jwt from "jsonwebtoken";
import multer from "multer";
import { nanoid } from "nanoid";
import Jimp from "jimp";
import fs from "fs";

import { User } from "../models/models.js";

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.token;

    if (token === undefined || token === null || token === "") {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded._id });

    if (!user || user.token !== token || user.token === "") {
      next({ statusCode: 401, message: "Unauthorized" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next({
      statusCode: 401,
      message: error.message || "Unauthorized",
    });
  }
};

const deleteFile = (filepath) => {
  return fs.unlink(filepath, (error) => {
    if (error) throw new Error(error.message);
    console.log(`${filepath} was deleted`);
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + nanoid() + ".jpg";
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const processAvatar = (file, filepath) => {
  Jimp.read(file.path)
    .then((image) => {
      image.resize(250, 250).write(filepath);
      deleteFile(file.path);
      return filepath;
    })
    .catch((error) => {
      return { statusCode: 500, message: error.message };
    });
};

export { authentication, deleteFile, storage, processAvatar };
