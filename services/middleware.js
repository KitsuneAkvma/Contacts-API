import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/models.js";

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (token === undefined || token === null || token === "") {
      throw new Error("Token not found");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error("User does not exist");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error.message);
    next({
      statusCode: 401,
      message: error.message || "Unauthorized",
    });
  }
};

export { authentication };
