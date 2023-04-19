import mongoose from "mongoose";

const { Schema } = mongoose;

const contactSchema = new Schema({
  name: {
    type: [String, "Name must be a string"],
    required: [true, "Name is required"],
    unique: [true, "Contact with this name already exists"],
  },
  email: {
    type: [String, "Email must be a string"],
    required: [true, "Email is required"],
    unique: [true, "Contact with this email already exists"],
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  phone: {
    type: [String, "Phone must be a string"],
    required: [true, "Phone is required"],
    unique: [true, "Contact with this phone already exists"],
    match: [
      /^(\+\d{1,3})?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/,
      "Invalid phone format",
    ],
  },
  favorite: { type: Boolean, default: false },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      "Password must have at least 6 characters, including uppercase, lowercase and number",
    ],
    trim: true,
  },

  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
});

const Contact = mongoose.model("Contact", contactSchema);
const User = mongoose.model("User", userSchema);

export { Contact, User };
