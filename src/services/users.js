import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "node:path";
import fs from "fs";
import sgMail from "@sendgrid/mail";

import { User } from "../models/models.js";
import { deleteFile, processAvatar } from "./middleware.js";
import { nanoid } from "nanoid";

const signUp = async (body) => {
  try {
    const { email, password } = body;
    const verificationToken = nanoid();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return {
        statusCode: 400,
        message: "User with this email already exists",
      };
    }
    // Check if password meets requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return {
        statusCode: 400,
        message:
          "Password must have at least 6 characters, including uppercase, lowercase and number",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // email verification
    await sendVerificationEmail(verificationToken, email);
    // Save new User to DB
    const newUser = new User({
      email,
      password: passwordHash,
      avatarURL: gravatar.profile_url(email),
      verificationToken,
    });
    await newUser.save();

    return {
      statusCode: 201,
      message: "Successfully created an account",
      verificationMessage:
        "Verification email sent to your email! Please verify your account by clicking  the link in the email. Please check your email!",
      user: { email, subscription: newUser.subscription },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error creating an account",
      error: error.message,
    };
  }
};
const login = async (body) => {
  try {
    const { email, password } = body;
    const user = await User.findOne({ email });
    if (!user) {
      return {
        statusCode: 404,
        message: "User with this email does not exist",
      };
    }
    const passwordsMatch = bcrypt.compareSync(password, user.password);
    if (!passwordsMatch) {
      return {
        statusCode: 401,
        message: "Incorrect password",
      };
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { token },
      { new: true }
    );

    return {
      statusCode: 202,
      message: "Successfully logged in",
      user: {
        email: updatedUser.email,
        subscription: user.subscription,
        token: updatedUser.token,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error authenticating user",
      error: error.message,
    };
  }
};

const logout = async (user, token) => {
  try {
    const userToLogout = await User.findOneAndUpdate(
      { _id: user._id, token },
      { token: "" },
      { new: true }
    );

    if (!userToLogout) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }
    return { statusCode: 200, message: "Successfully logged out" };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error logging out",
      error: error.message,
    };
  }
};

const updateSubscription = async (user, subscription) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { subscription },
      {
        new: true,
      }
    );
    if (!updatedUser) return { statusCode: 401, message: "Not authorized" };
    return {
      statusCode: 202,
      message: "Successfully updated subscription",
      user: {
        email: updatedUser.email,
        subscription: updatedUser.subscription,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error updating subscription",
      error: error.message,
    };
  }
};

const updateAvatar = async (user, file) => {
  try {
    const avatarPath = path.normalize(`public/avatars/${file.filename}`);
    processAvatar(file, avatarPath);

    const previousAvatarURL = user.avatarURL;
    await User.findByIdAndUpdate(
      user._id,
      {
        avatarURL: avatarPath,
      },
      { new: true }
    );
    if (previousAvatarURL && fs.existsSync(previousAvatarURL)) {
      deleteFile(previousAvatarURL);
    }
    return {
      statusCode: 202,
      message: "Successfully updated avatar",
      avatarURL: avatarPath,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error updating avatar",
      error: error.message,
    };
  }
};

async function sendVerificationEmail(token, email) {
  const nameFromEmail = email.slice(0, email.indexOf("@"));
  const msg = {
    to: email,
    from: "mateusz.r.martin@gmail.com",
    subject: "Email verification",
    text: `Hello ${nameFromEmail}!,`,
    html: `<p>Hello ${nameFromEmail}!,</p></br><p>Please click in link bellow to verify your account!</p></br>
  <a href="http://localhost:3000/api/users/verify/${token}">Click here </a>`,
  };

  await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent to", email);
    })
    .catch((error) => {
      console.error(error);
      throw new Error(error);
    });
}
export {
  signUp,
  login,
  logout,
  updateSubscription,
  updateAvatar,
  sendVerificationEmail,
};
