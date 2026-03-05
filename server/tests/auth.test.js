const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/User");
require("dotenv").config();

// Ensure JWT_SECRET exists for tests
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "testsecret123";
}

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Auth API", () => {
    const testUser = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        role: "student"
    };

    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual(testUser.name);
        expect(res.body.email).toEqual(testUser.email);
    });

    it("should not register a user with invalid password", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...testUser, password: "short", email: "invalid@test.com" });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain("Password must be at least 8 characters");
    });

    it("should login the user", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toEqual(testUser.email);
    });
});
