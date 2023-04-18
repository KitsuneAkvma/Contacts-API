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
});

const Contact = mongoose.model("Contact", contactSchema);

export { Contact };
