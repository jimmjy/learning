# Express Fundamentals Guide

## Core Concepts

### 1. Routing - The Foundation

**What it is**: Defining endpoints that respond to different HTTP methods and URLs

```javascript
app.get("/users", (req, res) => {}); // GET request
app.post("/users", (req, res) => {}); // POST request
app.put("/users/:id", (req, res) => {}); // PUT with parameter
app.delete("/users/:id", (req, res) => {}); // DELETE with parameter
```

**Key concepts**:

- Route parameters: `/users/:id` → `req.params.id`
- Query strings: `/users?page=1` → `req.query.page`
- Route order matters (first match wins)

### 2. Middleware - The Pipeline

**What it is**: Functions that run between request and response

```javascript
// Built-in middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.static("public")); // Serve static files

// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // MUST call next() or response hangs
});

// Route-specific middleware
app.get("/protected", authenticateUser, (req, res) => {});
```

**Key concepts**:

- Middleware runs in order
- Always call `next()` unless sending response
- Can modify `req` and `res` objects

### 3. Error Handling - The Safety Net

```javascript
// Try/catch in async routes
app.get("/users", async (req, res) => {
  try {
    const users = await getUsersFromDB();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Global error middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Using next(error) to trigger error middleware
app.get("/users/:id", (req, res, next) => {
  if (!req.params.id) {
    const error = new Error("ID is required");
    error.status = 400;
    return next(error); // Jumps directly to error middleware
  }
  // Continue with normal flow
  res.json({ id: req.params.id });
});
```

**See detailed error handling guide for advanced patterns**

```javascript

```

### 4. Request Parsing - Getting Data

```javascript
// URL parameters
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
});

// Query strings
app.get("/users", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
});

// Request body (needs express.json() middleware)
app.post("/users", (req, res) => {
  const { name, email } = req.body;
});
```

### 5. Authentication - JWT & Sessions

```javascript
// JWT middleware
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Usage
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});
```

### 6. Database Integration

```javascript
// Basic database connection pattern
const db = require("./database"); // Your database module

app.get("/users", async (req, res) => {
  try {
    const users = await db.query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});
```

---

## Micro Projects

### Project 1: Hello API (15 mins)

**Goal**: Basic server setup and routing

**Routes to implement**:

- `GET /` → `{ message: "Hello World", timestamp: "2024-01-01T12:00:00Z" }`
- `GET /health` → `{ status: "ok", uptime: 12345 }`
- `GET /random` → `{ number: 42, color: "blue" }`

**Success criteria**: All 3 routes return JSON, server runs on port 3000

**Starter code**:

```javascript
const express = require("express");
const app = express();

app.use(express.json());

// TODO: Implement your routes here

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Project 2: Todo CRUD (30 mins)

**Goal**: Full CRUD operations with in-memory storage

**Routes to implement**:

- `GET /todos` → `[{ id: 1, text: "Learn Express", completed: false }]`
- `POST /todos` (body: `{text: "New todo"}`) → `{ id: 2, text: "New todo", completed: false }`
- `PUT /todos/:id` (body: `{completed: true}`) → `{ id: 1, text: "Learn Express", completed: true }`
- `DELETE /todos/:id` → `{ message: "Todo deleted" }`

**Success criteria**: Can create, read, update, delete todos. Use array as storage.

**Starter code**:

```javascript
const express = require("express");
const app = express();

app.use(express.json());

let todos = [{ id: 1, text: "Learn Express", completed: false }];
let nextId = 2;

// TODO: Implement CRUD routes here

app.listen(3000, () => {
  console.log("Todo API running on port 3000");
});
```

### Project 3: Auth Guard (25 mins)

**Goal**: Protect routes with simple token authentication

**Routes to implement**:

- `POST /login` (body: `{username: "admin", password: "secret"}`) → `{ token: "abc123" }`
- `GET /public` → `{ message: "Anyone can see this" }`
- `GET /private` (needs Authorization header) → `{ message: "Secret data", user: "admin" }`

**Success criteria**: Private route returns 401 without token, 200 with valid token

### Project 4: Error Logger (20 mins)

**Goal**: Middleware for error handling and logging

**Features to implement**:

- Middleware that logs all requests: `"2024-01-01 GET /users 200"`
- Error middleware that catches all errors
- Route that intentionally throws error: `GET /error`
- Route that works normally: `GET /success`

**Success criteria**: Errors logged to console, client gets clean error response

### Project 5: File Uploader (30 mins)

**Goal**: Handle file uploads with validation

**Routes to implement**:

- `POST /upload` (multipart form with file) → `{ filename: "image.jpg", size: 1024, path: "/uploads/image.jpg" }`
- `GET /files` → `[{ name: "image.jpg", size: 1024, uploadedAt: "2024-01-01" }]`

**Success criteria**: Files saved to uploads folder, metadata tracked

**Required packages**: `npm install multer`

---

## Frontend Integration Notes

### When to use .json() vs .text()

**Use `.json()` when**:

- Server sends `Content-Type: application/json`
- Response body is valid JSON: `{"name": "John"}`, `[1,2,3]`, `{"error": "Not found"}`
- Most REST APIs (your Express routes above)

```javascript
// Server sends: res.json({ message: "Hello" })
const response = await fetch("/api/todos");
const data = await response.json(); // ✅ Correct
```

**Use `.text()` when**:

- Server sends plain text: `Content-Type: text/plain`
- HTML responses: `Content-Type: text/html`
- Server sends raw strings: `res.send("Just a string")`

```javascript
// Server sends: res.send("Operation successful")
const response = await fetch("/api/status");
const message = await response.text(); // ✅ Correct
```

**Use `.blob()` for**:

- Files, images: `Content-Type: image/jpeg`
- Binary data

### Quick Debug Tip

```javascript
const response = await fetch("/api/endpoint");
console.log(response.headers.get("content-type")); // Check what server sends
```

### Common Pattern in React

```javascript
try {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const todos = await response.json(); // Express res.json() → frontend .json()
  setTodos(todos);
} catch (error) {
  console.error("Fetch failed:", error);
}
```

### The Rule

Match your frontend method to what your Express server sends:

- `res.json()` → `.json()`
- `res.send("string")` → `.text()`
- `res.sendFile()` → `.blob()` or `.arrayBuffer()`

---

## Common Patterns & Best Practices

### Basic Server Setup

```javascript
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Environment Variables

```javascript
// .env file
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=postgres://localhost/mydb

// In your app
require('dotenv').config()
const port = process.env.PORT || 3000
```

### Response Patterns

```javascript
// Success responses
res.json({ data: users });
res.status(201).json({ message: "Created", data: newUser });

// Error responses
res.status(400).json({ error: "Bad request" });
res.status(404).json({ error: "Not found" });
res.status(500).json({ error: "Server error" });
```
