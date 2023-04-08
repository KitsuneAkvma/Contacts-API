import mongoose from "mongoose";

const { Schema } = mongoose;

const contactSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  favorite: { type: Boolean, default: false },
});

const Contact = mongoose.model("Contact", contactSchema);

export { Contact };
