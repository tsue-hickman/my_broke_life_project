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
  });


  // test the get /:id route

  // test the put /:id route

  // test the delete /:id route


});
