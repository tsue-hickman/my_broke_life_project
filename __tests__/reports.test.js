const request = require("supertest");
const express = require("express");
const router = require("../routes/reports");
const { generateToken } = require("../controllers/auth");
const dotenv = require("dotenv");
const dbHandler = require("../db/test-db-handler");
const User = require("../models/user");
const Category = require("../models/category");
const Transaction = require("../models/transaction");

// include the env values so we can decode tokens
dotenv.config();

const app = new express();
app.use(express.json());

// use reports router as our entry point /
app.use("/", router);

describe("Test Reports Routes", function () {
  //runs before all tests in the describe block
  beforeAll(async () => {
    //connect to an in memory database to mock the real one.
    await dbHandler.connect();

    //create a user in the mock database and generate a token for it.
    mockUser = new User({
      authProvider: "google",
      authId: "9101112",
      email: "reportTestUser@none.com",
      name: "ReportTestUser",
      role: "user",
    });
    await mockUser.save();
    token = generateToken(mockUser);

    //create a mock category for expenses
    mockExpenseCategory = new Category({
      userId: mockUser._id,
      name: "Food",
      type: "expense",
      color: "red",
    });
    await mockExpenseCategory.save();

    //create a mock category for income
    mockIncomeCategory = new Category({
      userId: mockUser._id,
      name: "Salary",
      type: "income",
      color: "green",
    });
    await mockIncomeCategory.save();

    //create some test transactions for the current month
    const currentDate = new Date();
    
    //add an expense transaction
    mockExpenseTransaction = new Transaction({
      userId: mockUser._id,
      categoryId: mockExpenseCategory._id,
      amount: 50.00,
      type: "expense",
      date: currentDate,
      note: "Groceries",
    });
    await mockExpenseTransaction.save();

    //add an income transaction
    mockIncomeTransaction = new Transaction({
      userId: mockUser._id,
      categoryId: mockIncomeCategory._id,
      amount: 1000.00,
      type: "income",
      date: currentDate,
      note: "Monthly salary",
    });
    await mockIncomeTransaction.save();
  });

  //runs after all tests in the describe block
  afterAll(async () => {
    //shutdown the mock database
    dbHandler.closeDatabase();
  });
  
   // test the get /monthly route without query params (should use current month)
  test("responds to get /monthly with current month", async () => {
    const res = await request(app)
      .get("/monthly")
      .set("Authorization", "Bearer " + token);
    
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    
    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("month");
    expect(res.body).toHaveProperty("total_income");
    expect(res.body).toHaveProperty("total_expenses");
    expect(res.body).toHaveProperty("categories");
    
    //check that the totals match what we created
    expect(res.body.total_income).toBe(1000);
    expect(res.body.total_expenses).toBe(50);
    expect(res.body.categories).toBeInstanceOf(Array);
  });

  // test the get /monthly route with a specific month query param
  test("responds to get /monthly with specific month", async () => {
    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const res = await request(app)
      .get("/monthly?month=" + month)
      .set("Authorization", "Bearer " + token);
    
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    
    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("month");
    expect(res.body.month).toBe(month);
  });

  // test with invalid month format
  test("returns 400 for invalid month format", async () => {
    const res = await request(app)
      .get("/monthly?month=invalid-date")
      .set("Authorization", "Bearer " + token);
    
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    
    //should return 400 bad request
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

});