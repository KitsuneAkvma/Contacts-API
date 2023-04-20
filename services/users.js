import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/models.js";

const signUp = async (body) => {
  try {
    const { email, password } = body;
    console.log({ email, password });

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

    const newUser = new User({ email, password: passwordHash });
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
      expiresIn: "1h",
    });
    await User.findByIdAndUpdate(user._id, token, { new: true });
    return {
      statusCode: 202,
      message: "Successfully logged in",
      user: { email, subscription: user.subscription, token },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error authenticating user",
      error: error.message,
    };
  }
};

export { signUp, login };
