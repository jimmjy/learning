# Express Error Handling - Explained Like You're 5

## The Big Picture: What is Error Handling?

Imagine you're a waiter at a restaurant (that's your Express server), and customers keep asking for things (that's HTTP requests). Sometimes things go wrong:

- The kitchen burns the food (database error)
- A customer asks for something not on the menu (404 error)
- The cash register breaks (server error)

**Error handling** is like having a plan for when things go wrong, so you can tell the customer what happened and what to do next, instead of just running away crying!

## Why Do We Need Error Handling?

### Without Error Handling

```javascript
app.get("/users/:id", async (req, res) => {
  const user = await database.getUser(req.params.id); // What if this fails?
  res.json(user); // This might never run if database fails!
});
```

**What happens?**

- If the database is down, your app crashes 💥
- The user sees a blank page or "Cannot GET /users/123"
- You have no idea what went wrong

### With Error Handling

```javascript
app.get("/users/:id", async (req, res) => {
  try {
    const user = await database.getUser(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Sorry, something went wrong!" });
  }
});
```

**What happens?**

- If the database fails, we catch the error 🎯
- We send a helpful message to the user
- Our app keeps running for other users

## Understanding Global Error Middleware

### The Magic of 4 Parameters

Think of Express like a assembly line in a toy factory. Each worker (middleware) does one job, then passes the toy to the next worker.

**Regular middleware** has 3 things:

- `req` (the toy coming in)
- `res` (the box to put the finished toy)
- `next` (pass it to the next worker)

**Error middleware** has 4 things:

- `err` (the broken toy that needs fixing)
- `req` (the original toy)
- `res` (the box to put a message about the broken toy)
- `next` (pass it to the next error fixer)

```javascript
// Regular worker (3 parameters)
app.use((req, res, next) => {
  console.log("Working on toy...");
  next(); // Pass to next worker
});

// Error fixer (4 parameters) - Express knows this fixes broken toys!
app.use((err, req, res, next) => {
  console.log("Oh no! Toy is broken:", err.message);
  res.status(500).json({ error: "We broke your toy, sorry!" });
});
```

### Why 4 Parameters Matter

Express is like a very specific robot. It looks at each function and counts the parameters:

- **3 parameters?** "This is a regular worker"
- **4 parameters?** "This is an error fixer"

If you forget a parameter, Express gets confused and won't use your error fixer!

```javascript
// ❌ Express thinks this is regular middleware (wrong!)
app.use((req, res, next) => {
  // This will NEVER catch errors
});

// ✅ Express knows this fixes errors (correct!)
app.use((err, req, res, next) => {
  // This WILL catch errors
});
```

## The Magic of next(error)

### How next() Usually Works

Normally, `next()` means "I'm done, pass to the next worker":

```javascript
app.use((req, res, next) => {
  console.log("Worker 1 is done");
  next(); // Go to worker 2
});

app.use((req, res, next) => {
  console.log("Worker 2 is done");
  next(); // Go to worker 3
});
```

### How next(error) Works

But if you put something inside `next()`, it's like pulling a fire alarm! 🚨

Everyone stops what they're doing and looks for the nearest fire fighter (error middleware):

```javascript
app.use((req, res, next) => {
  console.log("Worker 1 working...");

  if (somethingBadHappens) {
    const error = new Error("FIRE! FIRE!");
    next(error); // 🚨 EMERGENCY! Skip everyone, go to error handler!
  } else {
    next(); // Normal: go to next worker
  }
});

app.use((req, res, next) => {
  console.log("Worker 2..."); // This gets SKIPPED if there was an error!
  next();
});

// The fire fighter - only runs when there's an emergency!
app.use((err, req, res, next) => {
  console.log("Fire fighter here! Problem:", err.message);
  res.status(500).json({ error: "We put out the fire!" });
});
```

## Real-World Examples

### Example 1: Checking if User Exists

```javascript
app.get("/users/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if ID is valid
    if (!userId || userId.length < 1) {
      const error = new Error("User ID is required!");
      error.status = 400; // Bad request
      return next(error); // 🚨 Skip to error handler!
    }

    // Try to find user
    const user = await database.findUser(userId);

    if (!user) {
      const error = new Error("User not found!");
      error.status = 404; // Not found
      return next(error); // 🚨 Skip to error handler!
    }

    // Success! Send user data
    res.json(user);
  } catch (databaseError) {
    // Database is broken
    next(databaseError); // 🚨 Skip to error handler!
  }
});

// Our error handler catches ALL the problems above
app.use((err, req, res, next) => {
  console.log("Caught error:", err.message);

  const status = err.status || 500; // Use custom status or default to 500
  res.status(status).json({
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});
```

**What happens in each case?**

1. **No ID provided** → 400 error → "User ID is required!"
2. **User doesn't exist** → 404 error → "User not found!"
3. **Database is down** → 500 error → Database error message
4. **Everything works** → 200 success → User data

### Example 2: Multiple Error Handlers

You can have multiple fire fighters for different types of emergencies:

```javascript
// First fire fighter: Logger
app.use((err, req, res, next) => {
  console.log(`🚨 ERROR at ${new Date()}: ${err.message}`);
  next(err); // Pass to next fire fighter
});

// Second fire fighter: Specific error types
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "You sent bad data!",
      details: err.message,
    });
  }

  if (err.status === 404) {
    return res.status(404).json({
      error: "Page not found!",
      suggestion: "Check your URL",
    });
  }

  next(err); // Not my problem, pass to next fire fighter
});

// Final fire fighter: Catch everything else
app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Something mysterious went wrong!",
    hint: "Try again later or contact support",
  });
});
```

## Creating Custom Error Types

Just like you might have different types of problems (spilled milk vs broken toy), you can create different error types:

```javascript
// Custom error for when user does something wrong
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
  }
}

// Custom error for when we can't find something
class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

// Using them
app.post("/users", (req, res, next) => {
  if (!req.body.email) {
    return next(new ValidationError("Email is required!"));
  }

  if (!req.body.name) {
    return next(new ValidationError("Name is required!"));
  }

  // Create user...
});

app.get("/users/:id", async (req, res, next) => {
  const user = await findUser(req.params.id);
  if (!user) {
    return next(new NotFoundError("User not found!"));
  }

  res.json(user);
});
```

## The Async Problem and Solution

### The Problem

When you use `async/await`, errors don't automatically go to your error handler:

```javascript
// ❌ This is BROKEN!
app.get("/users", async (req, res) => {
  const users = await database.getUsers(); // If this fails, app crashes!
  res.json(users);
});
```

### Solution 1: try/catch

```javascript
// ✅ This works!
app.get("/users", async (req, res, next) => {
  try {
    const users = await database.getUsers();
    res.json(users);
  } catch (error) {
    next(error); // Send error to error handler
  }
});
```

### Solution 2: Async Wrapper (Advanced)

Create a helper that automatically catches errors:

```javascript
// Magic wrapper function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Now you don't need try/catch!
app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await database.getUsers(); // Errors automatically caught!
    res.json(users);
  }),
);
```

## Best Practices Summary

### 1. Always Use 4 Parameters for Error Middleware

```javascript
// ✅ Correct
app.use((err, req, res, next) => {});

// ❌ Wrong
app.use((req, res, next) => {});
```

### 2. Put Error Middleware Last

```javascript
// ✅ Correct order
app.get("/users", handler);
app.post("/users", handler);
app.use(errorHandler); // Last!

// ❌ Wrong order
app.use(errorHandler); // Too early!
app.get("/users", handler);
```

### 3. Always Handle Async Errors

```javascript
// ✅ Good
app.get("/data", async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// ❌ Bad
app.get("/data", async (req, res) => {
  const data = await fetchData(); // Might crash app!
  res.json(data);
});
```

### 4. Don't Leak Internal Errors in Production

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack); // Log full error for debugging

  // Don't show scary technical details to users
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong!"
      : err.message;

  res.status(err.status || 500).json({ error: message });
});
```

### 5. Use Status Codes Correctly

```javascript
const error = new Error("User not found");
error.status = 404; // Tell client what kind of error

next(error);
```

## Common Status Codes

- **400 Bad Request**: User sent wrong data
- **401 Unauthorized**: User needs to login
- **403 Forbidden**: User logged in but not allowed
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Our server broke

## Testing Your Error Handling

Create a test route that throws errors:

```javascript
app.get("/test-error", (req, res, next) => {
  const error = new Error("This is a test error!");
  error.status = 418; // I'm a teapot (real HTTP status!)
  next(error);
});
```

Visit `/test-error` and make sure your error handler catches it!

---

Remember: Error handling isn't about preventing all errors (impossible!), it's about handling them gracefully when they happen. Like wearing a seatbelt - you hope you don't need it, but you're glad it's there when something goes wrong! 🚗💺

