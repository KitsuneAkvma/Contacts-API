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

    const newUser = new User({ email, password });
    await newUser.save();

    return {
      statusCode: 200,
      message: "Successfully created an account",
      user: { email, subscription: newUser.subscription },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    };
  }
};

export { signUp };
