import jwt from "jsonwebtoken";
import multer from "multer";
import { nanoid } from "nanoid";
import Jimp from "jimp";
import fs from "fs";
import clc from "cli-color";

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
      console.log(clc.red.bold("Unauthorized access attempt: invalid token"));
      next({ statusCode: 401, message: "Unauthorized" });
    } else {
      console.log(clc.green.bold(`Authorized access granted: ${user.email}`));
      req.user = user;
      req.token = token;
      next();
    }
  } catch (error) {
    console.log(
      clc.red.bold(
        `Unauthorized access attempt: ${error.message || "Invalid token"}`
      )
    );
    next({ statusCode: 401, message: "Unauthorized" });
  }
};

const deleteFile = async (filepath, next) => {
  try {
    return fs.unlink(filepath, (error) => {
      if (error) throw new Error(error.message);
      console.log(
        clc.yellowBright.bgBlackBright.bold(
          `\nFile deleted: ${clc.blueBright(filepath)}`
        )
      );
    });
  } catch (error) {
    next(error);
  }
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
