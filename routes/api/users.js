import express from "express";
import { login, signUp } from "../../services/users.js";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    console.log(req.body);
    req.body === null && res.status(400).json({ message: "Bad request. " });
    const newUser = await signUp(req.body);

    res.status(newUser.statusCode).json(newUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await login(req.body);
    req.header = res.status(user.statusCode).json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
export default router;
