import mongoose from "mongoose";


const { Schema } = mongoose;

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],

    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],

    match: [
      /^(\+\d{1,3})?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/,
      "Invalid phone format",
    ],
  },
  favorite: { type: Boolean, default: false },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  avatarURL: {
    type: String,
  },
});
contactSchema.index({ name: 1, owner: 1 }, { unique: true });

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
  avatarURL: {
    type: String,
  },
});

const Contact = mongoose.model("Contact", contactSchema);
const User = mongoose.model("User", userSchema);

export { Contact, User };
