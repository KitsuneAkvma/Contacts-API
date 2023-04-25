import express from "express";
import {
  login,
  logout,
  signUp,
  updateSubscription,
} from "../../services/users.js";

import { authentication } from "../../services/middleware.js";
import multer from "multer";
import { nanoid } from "nanoid";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/avatars");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + nanoid() + ".jpg";
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

router.post("/signup", async (req, res, next) => {
  try {
    req.body === null && res.status(400).json({ message: "Bad request. " });
    const newUser = await signUp(req.body);

    res.status(newUser.statusCode).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await login(req.body);
    if (user.statusCode === 202) {
      res.cookie("token", user.user.token, {
        httpOnly: true,
        maxAge: 604800000, // 1 week
        secure: process.env.NODE_ENV === "production",
      });
    }

    res.status(user.statusCode).json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authentication, async (req, res, next) => {
  try {
    const user = req.user;
    const token = req.token;
    !token && res.status(401).json({ message: "Unauthorized" });
    const authorization = await logout(user, token);

    req.cookies?.token && res.clearCookie("token");

    res.status(authorization.statusCode).json(authorization);
  } catch (error) {
    next(error);
  }
});

// Get current user data
router.get("/current", authentication, async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "Success",
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
});

// Update user subscription
router.patch("/", authentication, async (req, res, next) => {
  try {
    const user = req.user;
    const { subscription } = req.body;
    !subscription &&
      res.status(400).json({ message: "Please specify subscription" });

    const validSubscriptions = ["starter", "pro", "business"];
    if (!validSubscriptions.includes(subscription)) {
      res.status(400).json({ message: "Please provide valid subscription" });
    }

    const updatedUser = await updateSubscription(user, subscription);

    res.status(updatedUser.statusCode).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

router.patch("/avatars", upload.single("avatar"), async (req, res, next) => {
  try {
    !req.file && res.status(400).json({ message: "Please provide avatar" });
    res.status(200).json(req.file);
  } catch (error) {
    next(error);
  }
});

export default router;
