import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "node:path";

import { User } from "../models/models.js";
import { processAvatar } from "./middleware.js";

const signUp = async (body) => {
  try {
    const { email, password } = body;

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

    const newUser = new User({
      email,
      password: passwordHash,
      avatarURL: gravatar.profile_url(email),
    });
    await newUser.save();

    return {
      statusCode: 201,
      message: "Successfully created an account",
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
        message: "Not authorized",
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
    const avatarPath = path.normalize(`./public/avatars/${file.filename}`);
    processAvatar(file, avatarPath);
    await User.findByIdAndUpdate(
      user._id,
      {
        avatarURL: avatarPath,
      },
      { new: true }
    );
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
export { signUp, login, logout, updateSubscription, updateAvatar };
