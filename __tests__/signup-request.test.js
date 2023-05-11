import request from "supertest";

import mongoose from "mongoose";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

import { User } from "../src/models/models.js";
import app from "../src/app.js";
import { nanoid } from "nanoid";

describe("signup route", () => {
  const testUser = {
    email: "signuptest@example.com",
    password: "Testpassword1",
    verificationToken: nanoid(),
  };

  beforeAll(async () => {
    dotenv.config();
    const DB_URI = process.env.DB_URI;
    mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  });

  afterEach(async () => {
    await User.deleteOne({ email: testUser.email });
  });
  it("returns a 201 status code and a success message for a valid request", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send(testUser);
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Successfully created an account");
  });

  it("returns a 400 status code and an error message if the email is already taken", async () => {
    await User.create(new User({ ...testUser }));

    const response = await request(app)
      .post("/api/users/signup")
      .send(testUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User with this email already exists");
  });

  it("returns a 400 status code and an error message if the password is invalid", async () => {
    const response = await request(app).post("/api/users/signup").send({
      email: testUser.email,
      password: "invalidpassword",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Password must have at least 6 characters, including uppercase, lowercase and number"
    );
  });
});
