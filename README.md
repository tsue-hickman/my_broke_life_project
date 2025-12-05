# My Broke Life Project

A backend API built as the **Final Project for the BYU–Idaho CSE 341: Web Backend Development** course.  
This project provides a personal finance tracking system where users can manage expenses, income, categories, budgets, and monthly financial reports.  
It uses **Node.js, Express, MongoDB, and JWT authentication**, and includes fully documented API routes through **Swagger UI**.

## Team Members
- **Arturo Ocampo Hernández**
- **Ovalle Rodríguez Jorge**
- **Hickman Tayler**
- **Tom Kester**

## Project Description

My Broke Life is a RESTful API that enables users to:
- Register/login using local credentials or Google OAuth
- Manage their personal finances
- Create and organize financial categories
- Track expenses and income with transactions
- Set monthly budgets
- Retrieve summarized monthly reports

The backend is built using a clean folder structure with controllers, routes, models, and middleware.  
The project uses **MongoDB** as the main database and includes 4+ collections as required.

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd my_broke_life_project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

Fill it with:
```env
MONGODB_URI=your-mongodb-connection-string
PORT=3000

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Connect your MongoDB

#### Option A — MongoDB Atlas
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mybrokelife
```

#### Option B — Local MongoDB
```
MONGODB_URI=mongodb://127.0.0.1:27017/mybrokelife
```

### 5. Required Collections
Automatically created by Mongoose:
- **users**
- **categories**
- **transactions**
- **budgets**

### 6. Start the server
```bash
npm start
```

Open API docs:  
http://localhost:3000/api/api-docs

## Project Structure
```
my_broke_life_project/
│
├── controllers/
├── routes/
├── models/
├── middleware/
├── db/
├── swagger.json
├── server.js
├── package.json
└── .env.example
```

## Architecture
Uses MVC-inspired structure:
- **Routes** → endpoints
- **Controllers** → logic
- **Models** → MongoDB schemas
- **Middleware** → auth & validation
- **DB Layer** → Mongo connection

## Conclusion
This project fulfills the CSE 341 Final Project Requirements:
✔ Node.js + Express  
✔ MongoDB with ≥ 4 collections  
✔ CRUD routes + authentication  
✔ OAuth integration  
✔ API docs at `/api/api-docs`  
✔ Clear architecture  
✔ Ready for team collaboration  
