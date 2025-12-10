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

});