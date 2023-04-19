import express from "express";
import { signUp } from "../../services/users.js";

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

export default router;
