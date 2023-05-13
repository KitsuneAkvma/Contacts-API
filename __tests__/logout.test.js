import request from "supertest";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";
import dotenv from "dotenv";

import { User } from "../src/models/models.js";
import app from "../src/app.js";
import { nanoid } from "nanoid";

describe("logout route", () => {
  const testUser = {
    email: "logouttest@example.com",
    password: "TestPassword1",
    verificationToken: nanoid(),
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
        verificationToken: testUser.verificationToken,
      })
    );
  });
  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  it("returns a 200 status code and a success message for a valid request", async () => {
    const agent = request.agent(app);
    const response = await agent.post("/api/users/login").send(testUser);

    const cookie = response.headers["set-cookie"][0].split(";")[0];
    const res = await agent
      .post("/api/users/logout")
      .set("Cookie", cookie)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Successfully logged out");
  });

  it("returns a 401 status code and an error message if the user is not logged in", async () => {
    const response = await request(app).post("/api/users/logout").send();
    expect(response.statusCode).toBe(401);
  });

  it("clears the 'token' cookie if the user is logged in", async () => {
    const agent = request.agent(app);
    const response = await agent.post("/api/users/login").send(testUser);

    const token = response.cookies?.token;

    const res = await agent
      .post("/api/users/logout")
      .set("Cookie", `token=${token}`)
      .send();

    expect(res.statusCode).toBe(200);

    expect(res.headers["set-cookie"]).toContain(
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
  });
});
