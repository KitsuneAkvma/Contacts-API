import jwt from "jsonwebtoken";

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

export { authentication };
