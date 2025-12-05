# My Broke Life Project

A backend API built as the **Final Project for the BYU–Idaho CSE 341: Web Backend Development** course.  
This API powers a personal finance tracking system where users can manage expenses, income, categories, budgets, and monthly financial reports.  
It is built with **Node.js, Express, MongoDB, Google OAuth, and JWT authentication**, and includes complete API documentation through **Swagger UI**.

---

## Team Members

- **Arturo Ocampo Hernández**
- **Ovalle Rodríguez Jorge**
- **Hickman Tayler**
- **Tom Kester**

---

## Project Description

My Broke Life is a RESTful backend service that enables users to:

- Authenticate using **Google OAuth only** (local email/password authentication has been removed).
- Manage their personal finances.
- Create and organize financial categories.
- Track expenses and income through transactions.
- Set monthly budgets.
- Retrieve summarized monthly financial reports.

The backend uses a clean MVC-inspired folder structure with controllers, routes, models, and middleware.  
Data is stored in **MongoDB**, which automatically manages the required collections.

---

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
PORT=3000

MONGODB_URI=your-mongodb-connection-string

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

⚠️ For production (e.g., Render), update `GOOGLE_REDIRECT_URI` to your deployed URL, for example:

```env
GOOGLE_REDIRECT_URI=https://my-broke-life-project.onrender.com/api/auth/google/callback
```

Make sure this same redirect URI is also configured in **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs**.

---

## MongoDB Connection

### Option A — MongoDB Atlas

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mybrokelife
```

### Option B — Local MongoDB

```env
MONGODB_URI=mongodb://127.0.0.1:27017/mybrokelife
```

---

## Required Collections

Automatically created by Mongoose:

- **users**
- **categories**
- **transactions**
- **budgets**

Each collection includes the fields required by the CSE 341 project specifications.

---

## Starting the Server

```bash
npm start
```

API docs (Swagger UI):

```text
http://localhost:3000/api/api-docs
```

---

## Authentication Flow (Google OAuth)

The backend exposes two main endpoints to handle Google OAuth:

### 1. Get Google OAuth Login URL

```http
GET /api/auth/google/url
```

**Description:**  
Returns the Google OAuth URL that the frontend should use to redirect the user to Google’s login/consent screen.

**Example response:**

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

The frontend can simply redirect the browser to this `url`.

---

### 2. Google OAuth Callback

```http
GET /api/auth/google/callback?code=...
```

**Description:**  
This endpoint is called by Google after the user authenticates. It:

1. Receives the `code` from Google in the query string.  
2. Exchanges the `code` for Google tokens (`idToken`, `access_token`, etc.).  
3. Decodes the Google `idToken` to extract user profile information.  
4. Creates the user in MongoDB if needed.  
5. Generates the API’s internal JWT for the user.  
6. Returns both tokens and the user object.

**Example response:**

```json
{
  "idToken": "google-id-token-here",
  "token": "internal-jwt-token-here",
  "user": {
    "id": "mongodb-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

The frontend should store `token` (the internal JWT) and use it in the `Authorization` header for protected routes:

```http
Authorization: Bearer <token>
```

---

## Project Structure

```text
my_broke_life_project/
│
├── controllers/        # Request handlers
├── routes/             # API endpoints
├── models/             # Mongoose schemas
├── middleware/         # Auth & validation
├── db/                 # Database configuration
│
├── swagger.json        # Swagger documentation
├── server.js           # App entry point
├── package.json
└── .env.example
```

---

## Architecture

Uses an MVC-inspired structure:

- **Routes** → define endpoints and map to controllers  
- **Controllers** → contain business logic  
- **Models** → define MongoDB schemas via Mongoose  
- **Middleware** → handle authentication and request validation  
- **DB Layer** → manages MongoDB connection

---

## Conclusion

This project fulfills the CSE 341 Final Project requirements:

- ✅ Node.js + Express  
- ✅ MongoDB with ≥ 4 collections  
- ✅ CRUD routes + authentication  
- ✅ Google OAuth integration (no local email/password auth)  
- ✅ API docs at `/api/api-docs`  
- ✅ Clear, maintainable architecture  
- ✅ Ready for team collaboration
