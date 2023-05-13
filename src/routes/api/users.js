import express from "express";
import multer from "multer";

import {
  login,
  logout,
  sendVerificationEmail,
  signUp,
  updateAvatar,
  updateSubscription,
} from "../../services/users.js";
import { authentication, storage } from "../../services/middleware.js";
import { User } from "../../models/models.js";

const router = express.Router();

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
    !token && res.status(401).send({ message: "Unauthorized" });
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

// Update user avatar
router.patch(
  "/avatars",
  authentication,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { user, file } = req;
      !file && res.status(400).json({ message: "Please provide avatar" });

      const updatedUser = await updateAvatar(user, file);
      res.status(updatedUser.statusCode || 200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);
// email verification
router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOneAndUpdate(
      { verificationToken },
      {
        verificationToken: null,
        verify: true,
      },
      { new: true }
    );
    console.log({ verificationToken, user });
    user
      ? res.status(200).json({ message: "Verification successful" })
      : res.status(400).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
});
// Resend email verification
router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isVerified = user.verify;

      if (!isVerified) {
        const verificationToken = user.verificationToken;
        await sendVerificationEmail(verificationToken, email);
        res.status(200).json({
          message:
            "Email sent to your inbox! Please check other categories as well your spam folder !",
        });
      } else {
        res.status(400).json({ message: "Already verified!" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
});
export default router;
