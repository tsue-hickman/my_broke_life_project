const request = require("supertest");
const express = require("express");
const router = require("../routes/budgets");
const { generateToken } = require("../controllers/auth");
const dotenv = require("dotenv");
const dbHandler = require("../db/test-db-handler");
const User = require("../models/user");
const Category = require("../models/category");

// include the env values so we can decode tokens
dotenv.config();

const app = new express();
app.use(express.json());

// use budgets router as our entry point /
app.use("/", router);

describe("Test Budget Routes", function () {
  //runs before all tests in the describe block
  beforeAll(async () => {
    //connect to an in memory database to mock the real one.
    await dbHandler.connect();

    //create a user in the mock database and generate a token for it.
    mockUser = new User({
      authProvider: "google",
      authId: "1234123",
      email: "budgetTestUser@none.com",
      name: "TestUser",
      role: "user",
    });
    await mockUser.save();
    token = generateToken(mockUser);

    //create a mock category for our budget to go into
    mockCategory = new Category({
      userId: mockUser._id,
      name: "mockCategory1",
      type: "expense",
      color: "red",
    });
    await mockCategory.save();

    mockBudget = {};
  });

  //runs after all tests in the describe block
  afterAll(async () => {
    //shutdown the mock database
    dbHandler.closeDatabase();
  });

  // test the get / route
  test("responds to get /", async () => {
    const res = await request(app)
      .get("/")
      .set("Authorization", "Bearer " + token);
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
  });

  // test the post / route
  test("responds to post /", async () => {
    data = {
      userId: mockUser._id,
      categoryId: mockCategory._id,
      month: "2025-01",
      limit: 1,
      spent: 0,
    };

    const res = await request(app)
      .post("/")
      .set("Authorization", "Bearer " + token)
      .send(data);

    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //expect json and 201 to come back. Then check for a few fields in the json
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("categoryId");
    expect(res.body).toHaveProperty("createdAt");
    mockBudget = res.body;
  });

  // test the get /:id route
  test("responds to get /:id", async () => {
    const res = await request(app)
      .get("/" + mockBudget._id)
      .set("Authorization", "Bearer " + token);
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("categoryId");
    expect(res.body).toHaveProperty("createdAt");
  });

  // test the put /:id route
  test("responds to put /:id", async () => {
    data = {
      userId: mockUser._id,
      categoryId: mockCategory._id,
      month: "2025-02",
      limit: 2,
    };

    const res = await request(app)
      .put("/" + mockBudget._id)
      .set("Authorization", "Bearer " + token)
      .send(data);

    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //expect json and 201 to come back. Then check for a few fields in the json
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("categoryId");
    expect(res.body).toHaveProperty("createdAt");
    expect(res.body.limit).toBe(2);
    expect(res.body.month).toBe("2025-02");
    expect(JSON.stringify(res.body.userId)).toEqual(
      JSON.stringify(mockUser._id)
    );
    expect(JSON.stringify(res.body.categoryId)).toEqual(
      JSON.stringify(mockCategory._id)
    );
    mockBudget = res.body;
  });

  // test the delete /:id route

  test("responds to delete /:id", async () => {
    const res = await request(app)
      .delete("/" + mockBudget._id)
      .set("Authorization", "Bearer " + token);
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }

    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Budget deleted successfully");
  });
});
