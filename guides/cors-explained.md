# CORS (Cross-Origin Resource Sharing) - Explained Like You're 5

## The Big Picture: What is CORS?

Imagine the internet is like a giant neighborhood with millions of houses (websites). Each house has its own address (domain like google.com, facebook.com, etc.).

**Without CORS (the old dangerous days):**
- Any house could walk into any other house and take whatever they wanted
- Bad guys could trick your house into giving away your secrets to their house
- No security, total chaos! 😱

**With CORS (modern security):**
- Each house has a security guard (browser) at the door
- The guard checks: "Are you allowed to take things from this house?"
- Houses must explicitly say "Yes, that other house can take my stuff"
- Much safer! 🛡️

## The Real Problem CORS Solves

### The Same-Origin Policy

Browsers have a security rule called **Same-Origin Policy**. It says:

> "JavaScript running on website A can only make requests to website A. No talking to other websites!"

**Why this rule exists:**
```javascript
// Imagine you're logged into your bank at mybank.com
// You visit evilsite.com in another tab
// Without same-origin policy, evilsite.com could do this:

fetch('https://mybank.com/transfer-money', {
  method: 'POST',
  body: JSON.stringify({ to: 'evil-account', amount: 1000000 })
})
// And steal all your money! 😨
```

### What Counts as "Same Origin"?

An origin is made of three parts:
1. **Protocol** (http:// or https://)
2. **Domain** (google.com, localhost, etc.)
3. **Port** (:3000, :8080, etc.)

```javascript
// These are the SAME origin:
https://mysite.com/page1
https://mysite.com/page2
https://mysite.com/api/users

// These are DIFFERENT origins:
https://mysite.com      (original)
http://mysite.com       (different protocol)
https://othersite.com   (different domain)
https://mysite.com:8080 (different port)
```

### The Development Problem

This creates a problem during development:

```bash
# Your frontend runs on:
http://localhost:3000

# Your backend API runs on:
http://localhost:4000

# These are DIFFERENT origins! (different ports)
# So browser blocks your frontend from calling your API! 😤
```

## Understanding CORS Step by Step

### The CORS Handshake

When your frontend tries to talk to a different origin, browsers do a "security handshake":

```javascript
// 1. Frontend (localhost:3000) wants to call API (localhost:4000)
fetch('http://localhost:4000/api/users')

// 2. Browser says: "Wait! This is cross-origin. Let me check..."

// 3. Browser asks API server: "Hey, is localhost:3000 allowed to call you?"

// 4. API server responds with CORS headers:
//    "Yes, localhost:3000 is allowed"
//    OR
//    "No, go away"

// 5. Browser either allows or blocks the request
```

### Simple Requests vs Preflight Requests

#### Simple Requests (Direct)
Some requests are considered "simple" and happen immediately:

```javascript
// Simple requests (no preflight needed):
fetch('http://api.example.com/data')  // GET request
fetch('http://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: 'hello'
})
```

**Simple request requirements:**
- Method: GET, HEAD, or POST
- Only certain headers allowed
- Content-Type must be: text/plain, multipart/form-data, or application/x-www-form-urlencoded

#### Preflight Requests (Two-Step)
More complex requests trigger a "preflight" check:

```javascript
// This triggers preflight because of custom header:
fetch('http://api.example.com/data', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',  // Not simple!
    'Authorization': 'Bearer token123'   // Custom header!
  },
  body: JSON.stringify({ name: 'John' })
})
```

**What happens:**
```http
# Step 1: Browser sends preflight OPTIONS request
OPTIONS /data HTTP/1.1
Host: api.example.com
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

# Step 2: Server responds with permissions
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400

# Step 3: If allowed, browser sends actual request
POST /data HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123
{"name": "John"}
```

## CORS Headers Explained

### Server Response Headers (What API Sends)

#### Access-Control-Allow-Origin
"Who is allowed to call me?"

```http
# Allow one specific origin
Access-Control-Allow-Origin: http://localhost:3000

# Allow any origin (DANGEROUS!)
Access-Control-Allow-Origin: *

# Allow multiple origins (do this in code, not header)
# if (origin === 'http://localhost:3000' || origin === 'https://mysite.com') {
#   res.header('Access-Control-Allow-Origin', origin)
# }
```

#### Access-Control-Allow-Methods
"What HTTP methods are allowed?"

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

#### Access-Control-Allow-Headers
"What headers can the client send?"

```http
Access-Control-Allow-Headers: Content-Type, Authorization, X-Custom-Header
```

#### Access-Control-Allow-Credentials
"Can the client send cookies/auth info?"

```http
Access-Control-Allow-Credentials: true
```

**Important:** When credentials are allowed, you CANNOT use `*` for origin:

```http
# ❌ WRONG - doesn't work
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

# ✅ CORRECT
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

#### Access-Control-Expose-Headers
"What response headers can the client read?"

```http
# By default, client can only read basic headers
# To expose custom headers:
Access-Control-Expose-Headers: X-Total-Count, X-Custom-Data
```

#### Access-Control-Max-Age
"How long can browser cache preflight response?"

```http
Access-Control-Max-Age: 86400  # 24 hours in seconds
```

### Client Request Headers (What Browser Sends)

#### Origin
Browser automatically sends this with cross-origin requests:

```http
Origin: http://localhost:3000
```

#### Access-Control-Request-Method (Preflight only)
"What method will the actual request use?"

```http
Access-Control-Request-Method: POST
```

#### Access-Control-Request-Headers (Preflight only)
"What headers will the actual request include?"

```http
Access-Control-Request-Headers: Content-Type, Authorization
```

## Setting Up CORS in Different Frameworks

### Express.js with cors Package

```javascript
const express = require('express')
const cors = require('cors')
const app = express()

// Option 1: Allow all origins (development only!)
app.use(cors())

// Option 2: Specific configuration
app.use(cors({
  origin: 'http://localhost:3000',  // Only allow this origin
  methods: ['GET', 'POST'],         // Only allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true                 // Allow cookies
}))

// Option 3: Multiple origins
app.use(cors({
  origin: ['http://localhost:3000', 'https://mysite.com'],
  credentials: true
}))

// Option 4: Dynamic origin checking
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = ['http://localhost:3000', 'https://mysite.com']
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

// Routes
app.get('/api/users', (req, res) => {
  res.json([{ name: 'John' }, { name: 'Jane' }])
})

app.listen(4000)
```

### Express.js Manual CORS

```javascript
const express = require('express')
const app = express()

// Manual CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin
  const allowedOrigins = ['http://localhost:3000', 'https://mysite.com']
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Max-Age', '86400') // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  next()
})

app.get('/api/users', (req, res) => {
  res.json([{ name: 'John' }, { name: 'Jane' }])
})

app.listen(4000)
```

### Next.js API Routes

```javascript
// pages/api/users.js or app/api/users/route.js

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Your API logic
  if (req.method === 'GET') {
    res.json([{ name: 'John' }, { name: 'Jane' }])
  }
}

// Or using Next.js middleware (middleware.js)
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
    
    return response
  }
}
```

### Python Flask

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Option 1: Enable CORS for all routes
CORS(app)

# Option 2: Specific configuration
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

# Option 3: Per-route CORS
from flask_cors import cross_origin

@app.route('/api/users')
@cross_origin(origins=['http://localhost:3000'])
def get_users():
    return jsonify([{'name': 'John'}, {'name': 'Jane'}])

if __name__ == '__main__':
    app.run(port=4000)
```

## Frontend: Making CORS Requests

### Basic Fetch Requests

```javascript
// Simple GET request
async function getUsers() {
  try {
    const response = await fetch('http://localhost:4000/api/users')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const users = await response.json()
    console.log('Users:', users)
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.error('CORS error - check server CORS configuration')
    } else {
      console.error('Request failed:', error)
    }
  }
}

// POST request with JSON
async function createUser(userData) {
  try {
    const response = await fetch('http://localhost:4000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to create user:', error)
  }
}
```

### Requests with Credentials (Cookies/Auth)

```javascript
// Include cookies and auth headers
async function getProtectedData() {
  const response = await fetch('http://localhost:4000/api/protected', {
    method: 'GET',
    credentials: 'include',  // Include cookies
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
  
  return response.json()
}

// Login request that sets cookies
async function login(email, password) {
  const response = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    credentials: 'include',  // Allow server to set cookies
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  
  return response.json()
}
```

### Handling CORS Errors

```javascript
async function makeRequest() {
  try {
    const response = await fetch('http://localhost:4000/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    // Different types of CORS errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('CORS Error: Server not allowing this origin')
      // Show user-friendly message
      alert('Unable to connect to server. Please check if the server is running and configured correctly.')
    } else if (error.message.includes('NetworkError')) {
      console.error('Network Error: Server might be down')
    } else {
      console.error('Unknown error:', error)
    }
  }
}
```

## Common CORS Scenarios and Solutions

### Development Setup

**Problem:** Frontend (localhost:3000) can't call backend (localhost:4000)

**Solution 1: Configure backend CORS**
```javascript
// In your Express server
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

**Solution 2: Use proxy in frontend**
```json
// In package.json (Create React App)
{
  "name": "my-app",
  "proxy": "http://localhost:4000"
}

// Now you can call relative URLs:
fetch('/api/users')  // Automatically proxied to localhost:4000/api/users
```

```javascript
// In Next.js (next.config.js)
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*'
      }
    ]
  }
}
```

### Production Setup

**Problem:** Frontend (https://mysite.com) needs to call API (https://api.mysite.com)

```javascript
// Production CORS configuration
app.use(cors({
  origin: [
    'https://mysite.com',
    'https://www.mysite.com',
    'http://localhost:3000'  // Keep for development
  ],
  credentials: true
}))
```

### Third-Party API Calls

**Problem:** Can't call external APIs from frontend due to CORS

```javascript
// ❌ This will fail - external API doesn't allow your origin
fetch('https://external-api.com/data')

// ✅ Solution 1: Use your backend as proxy
// In your backend:
app.get('/api/external-data', async (req, res) => {
  const response = await fetch('https://external-api.com/data')
  const data = await response.json()
  res.json(data)
})

// In your frontend:
fetch('/api/external-data')  // Call your backend instead

// ✅ Solution 2: Use serverless function (Vercel/Netlify)
// api/external-data.js
export default async function handler(req, res) {
  const response = await fetch('https://external-api.com/data')
  const data = await response.json()
  res.json(data)
}
```

### Mobile App CORS

Mobile apps don't have CORS restrictions:

```javascript
// Mobile apps can call any API directly
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
})
// This works fine in React Native, Flutter, etc.
```

## Security Considerations

### Never Use Wildcard with Credentials

```javascript
// ❌ DANGEROUS - Allows any site to make authenticated requests
app.use(cors({
  origin: '*',
  credentials: true
}))

// ✅ SAFE - Only specific origins with credentials
app.use(cors({
  origin: ['https://mysite.com'],
  credentials: true
}))
```

### Environment-Based Configuration

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://mysite.com', 'https://www.mysite.com']
  : ['http://localhost:3000', 'http://localhost:3001']

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
```

### Validate Origins Properly

```javascript
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true)
    
    // Check against whitelist
    const allowedOrigins = ['https://mysite.com', 'http://localhost:3000']
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
```

## Debugging CORS Issues

### Browser Developer Tools

```javascript
// In browser console, check for CORS errors:
// "Access to fetch at 'http://localhost:4000/api/users' from origin 'http://localhost:3000' has been blocked by CORS policy"

// Check Network tab:
// - Look for OPTIONS preflight requests
// - Check response headers for Access-Control-* headers
// - Verify status codes (preflight should be 200)
```

### Common Error Messages and Solutions

#### "No 'Access-Control-Allow-Origin' header"
```javascript
// Problem: Server not sending CORS headers
// Solution: Add CORS middleware to server

app.use(cors({
  origin: 'http://localhost:3000'
}))
```

#### "Credentials flag is 'true', but origin is '*'"
```javascript
// Problem: Using wildcard with credentials
// Solution: Specify exact origin

// ❌ Wrong
app.use(cors({
  origin: '*',
  credentials: true
}))

// ✅ Correct
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

#### "Method not allowed"
```javascript
// Problem: Method not in Access-Control-Allow-Methods
// Solution: Add method to allowed methods

app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE']  // Add missing method
}))
```

#### "Header not allowed"
```javascript
// Problem: Custom header not in Access-Control-Allow-Headers
// Solution: Add header to allowed headers

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header']
}))
```

### Testing CORS Configuration

```javascript
// Test script to verify CORS
async function testCORS() {
  const tests = [
    { method: 'GET', url: '/api/users' },
    { method: 'POST', url: '/api/users', body: { name: 'Test' } },
    { method: 'PUT', url: '/api/users/1', body: { name: 'Updated' } },
    { method: 'DELETE', url: '/api/users/1' }
  ]
  
  for (const test of tests) {
    try {
      const response = await fetch(`http://localhost:4000${test.url}`, {
        method: test.method,
        headers: test.body ? { 'Content-Type': 'application/json' } : {},
        body: test.body ? JSON.stringify(test.body) : undefined,
        credentials: 'include'
      })
      
      console.log(`✅ ${test.method} ${test.url}: ${response.status}`)
    } catch (error) {
      console.log(`❌ ${test.method} ${test.url}: ${error.message}`)
    }
  }
}

testCORS()
```

## Advanced CORS Topics

### Preflight Caching

```javascript
// Cache preflight responses to reduce requests
app.use(cors({
  maxAge: 86400  // Cache for 24 hours
}))

// Browser won't send preflight for same request type within 24 hours
```

### Custom Headers and CORS

```javascript
// Server: Allow custom headers
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Custom-Header']
}))

// Client: Send custom headers
fetch('/api/data', {
  headers: {
    'X-API-Key': 'my-api-key',
    'X-Custom-Header': 'custom-value'
  }
})
```

### Exposing Response Headers

```javascript
// Server: Expose custom response headers
app.use(cors({
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}))

app.get('/api/users', (req, res) => {
  res.header('X-Total-Count', '100')
  res.header('X-Page-Count', '10')
  res.json(users)
})

// Client: Read exposed headers
const response = await fetch('/api/users')
const totalCount = response.headers.get('X-Total-Count')
const pageCount = response.headers.get('X-Page-Count')
```

### CORS with WebSockets

```javascript
// WebSockets don't use CORS, but have their own origin checks
const WebSocket = require('ws')

const wss = new WebSocket.Server({
  port: 8080,
  verifyClient: (info) => {
    const origin = info.origin
    const allowedOrigins = ['http://localhost:3000', 'https://mysite.com']
    return allowedOrigins.includes(origin)
  }
})
```

## Real-World Example: Complete Setup

### Backend (Express Server)

```javascript
// server.js
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

// Middleware
app.use(cookieParser())
app.use(express.json())

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',    // React dev server
      'http://localhost:3001',    // Alternative port
      'https://mysite.com',       // Production frontend
      'https://www.mysite.com'    // Production www
    ]
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,  // Allow cookies
  optionsSuccessStatus: 200,  // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}

app.use(cors(corsOptions))

// Routes
app.get('/api/users', (req, res) => {
  res.header('X-Total-Count', '100')
  res.json([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ])
})

app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  const newUser = { id: Date.now(), name, email }
  res.status(201).json(newUser)
})

app.post('/api/login', (req, res) => {
  // Set HTTP-only cookie
  res.cookie('authToken', 'jwt-token-here', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  })
  
  res.json({ message: 'Logged in successfully' })
})

app.get('/api/protected', (req, res) => {
  const token = req.cookies.authToken
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  
  res.json({ message: 'Secret data', user: 'John' })
})

// Error handling
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS: Origin not allowed' })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000')
})
```

### Frontend (React Component)

```javascript
// UserManager.js
import React, { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:4000'

function UserManager() {
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        credentials: 'include'  // Include cookies
      })
      
      if (response.ok) {
        const userData = await response.json()
        const totalCount = response.headers.get('X-Total-Count')
        
        setUsers(userData)
        console.log(`Total users in database: ${totalCount}`)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  // Create user
  const createUser = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newUser)
      })
      
      if (response.ok) {
        const user = await response.json()
        setUsers([...users, user])
        setNewUser({ name: '', email: '' })
      }
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  // Login
  const login = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // Allow server to set cookies
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
      
      if (response.ok) {
        setIsLoggedIn(true)
        console.log('Logged in successfully')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  // Access protected route
  const getProtectedData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/protected`, {
        credentials: 'include'  // Send cookies
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Protected data:', data)
      } else {
        console.log('Access denied')
      }
    } catch (error) {
      console.error('Failed to access protected route:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      <h2>User Manager</h2>
      
      <div>
        <button onClick={login}>Login</button>
        <button onClick={getProtectedData}>Get Protected Data</button>
        <span>Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}</span>
      </div>
      
      <form onSubmit={createUser}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
        />
        <button type="submit">Add User</button>
      </form>
      
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  )
}

export default UserManager
```

## Summary: Key CORS Concepts

### Why CORS Exists
- **Security**: Prevents malicious websites from accessing your data
- **Same-Origin Policy**: Browsers block cross-origin requests by default
- **Controlled Access**: Servers must explicitly allow cross-origin requests

### How CORS Works
1. **Browser checks**: Is this a cross-origin request?
2. **Simple requests**: Go through immediately if they meet criteria
3. **Preflight requests**: Browser asks permission first with OPTIONS request
4. **Server responds**: With CORS headers allowing or denying access
5. **Browser enforces**: Allows or blocks based on server response

### Essential Headers
- **Access-Control-Allow-Origin**: Who can access this resource
- **Access-Control-Allow-Methods**: What HTTP methods are allowed
- **Access-Control-Allow-Headers**: What headers can be sent
- **Access-Control-Allow-Credentials**: Whether to include cookies/auth

### Best Practices
1. Never use `*` with credentials
2. Be specific with allowed origins
3. Use environment-based configuration
4. Handle preflight requests properly
5. Cache preflight responses when possible
6. Validate origins server-side
7. Use HTTPS in production

### Common Mistakes
- Forgetting to handle OPTIONS requests
- Using wildcard with credentials
- Not including credentials in client requests
- Wrong origin format (missing protocol/port)
- Not exposing custom response headers

Remember: CORS is like a friendly security guard that checks IDs at the door - it keeps bad actors out while letting legitimate visitors in! 🛡️🚪