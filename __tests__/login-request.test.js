import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import mongoose from "mongoose";
import dotenv from "dotenv";

import { User } from "../src/models/models.js";
import app from "../src/app.js";
import { nanoid } from "nanoid";

describe("login function", () => {
  const testUser = {
    email: "logintest@example.com",
    password: "testpassword",
  };

  beforeAll(async () => {
    dotenv.config();
    const DB_URI = process.env.DB_URI;
    mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    await User.create(
      new User({
        email: testUser.email,
        password: hashedPassword,
        verificationToken: nanoid(),
      })
    );
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  it("returns a 404 error for a non-existent user", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: "nonexistent@example.com", password: "password123" });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User with this email does not exist");
  });

  it("returns a 401 error for an incorrect password", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Incorrect password");
  });

  it("returns a token and the user's subscription for a successful login", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.statusCode).toBe(202);
    expect(response.body.message).toBe("Successfully logged in");
    expect(response.body.user).toHaveProperty("token");
    expect(response.body.user.subscription).toBeDefined();
    expect(response.body.user.subscription).toBeDefined();
  });

  it("sets an HTTP-only cookie with the JWT token for a successful login", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.header["set-cookie"]).toBeDefined();

    const cookieHeader = response.header["set-cookie"][0];
    const cookieString = cookieHeader.split(";")[0];
    const cookie = cookieString.split("=")[1];

    const decodedToken = jwt.verify(cookie, process.env.JWT_SECRET);

    expect(decodedToken._id).toBeDefined();
  });
});
