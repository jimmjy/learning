# Express Authentication - Explained Like You're 5

## The Big Picture: What is Authentication?

Imagine you're going to a super exclusive club (that's your app). Authentication is like the bouncer at the door who checks if you're allowed in.

**Without Authentication:**
- Anyone can walk into any room
- People can pretend to be someone else
- Chaos! 😱

**With Authentication:**
- Bouncer checks your ID at the door
- You get a special wristband that proves you're allowed in
- Security guards throughout the club can see your wristband and know you belong

## The Three Main Players

### 1. **Who You Are** (Authentication)
"Hi, I'm John Smith" - You tell the bouncer your name

### 2. **Prove It** (Verification) 
"Here's my driver's license" - You show proof of who you are

### 3. **What You Can Do** (Authorization)
"My wristband is gold, so I can go to the VIP room" - Your permissions

## Traditional Sessions vs Modern Tokens

### Old School: Sessions (Like Hotel Room Keys)

Imagine checking into a hotel:

1. **You check in** → Give your name and credit card
2. **Hotel gives you a room key** → Key card with your room number
3. **Hotel keeps a record** → "Room 205 belongs to John Smith"
4. **You use the key** → Swipe card to open door
5. **Hotel checks their records** → "Yep, John is in room 205"

```javascript
// Server keeps a session store (like hotel's computer system)
const sessions = {
  'abc123': { userId: 42, name: 'John', expires: Date.now() + 3600000 }
}

// Login creates a session
app.post('/login', (req, res) => {
  // Check username/password...
  
  const sessionId = 'abc123' // Generate random ID
  sessions[sessionId] = { 
    userId: 42, 
    name: 'John',
    expires: Date.now() + 3600000 // 1 hour from now
  }
  
  // Send session ID back as cookie
  res.cookie('sessionId', sessionId, { httpOnly: true })
  res.json({ message: 'Logged in!' })
})

// Check session on protected routes
app.get('/profile', (req, res) => {
  const sessionId = req.cookies.sessionId
  const session = sessions[sessionId]
  
  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'Please log in' })
  }
  
  res.json({ message: `Hello ${session.name}!` })
})
```

**Problems with Sessions:**
- Server must remember EVERY user's session
- If server restarts, everyone gets logged out
- Hard to scale to multiple servers

### Modern Way: JWT Tokens (Like Magic ID Cards)

Imagine a magic ID card that:
- Contains all your info
- Can't be faked (it's signed with secret ink)
- Anyone can read it and verify it's real
- Doesn't need to call the main office to check

```javascript
const jwt = require('jsonwebtoken')
const SECRET = 'super-secret-key-dont-tell-anyone'

// Login creates a JWT token
app.post('/login', (req, res) => {
  // Check username/password...
  
  const tokenData = {
    userId: 42,
    name: 'John',
    email: 'john@example.com'
  }
  
  // Create magic ID card (JWT token)
  const token = jwt.sign(tokenData, SECRET, { expiresIn: '1h' })
  
  res.json({ 
    message: 'Logged in!',
    token: token // Send the magic ID card to user
  })
})

// Check token on protected routes
app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'No magic ID card!' })
  }
  
  try {
    // Verify the magic ID card is real
    const user = jwt.verify(token, SECRET)
    res.json({ message: `Hello ${user.name}!`, user })
  } catch (error) {
    res.status(403).json({ error: 'Fake magic ID card!' })
  }
})
```

## Understanding JWT Tokens Deep Dive

### What's Inside a JWT Token?

A JWT token looks like: `xxxxx.yyyyy.zzzzz`

It has 3 parts separated by dots:

1. **Header** (xxxxx): "This is a JWT token, signed with HMAC"
2. **Payload** (yyyyy): Your actual data (user info)
3. **Signature** (zzzzz): Secret signature that proves it's real

```javascript
// What's actually inside:
{
  // Header
  {
    "alg": "HS256",
    "typ": "JWT"
  },
  
  // Payload (your data)
  {
    "userId": 42,
    "name": "John",
    "email": "john@example.com",
    "iat": 1516239022,  // issued at
    "exp": 1516242622   // expires at
  },
  
  // Signature (invisible magic ink)
  // Created using header + payload + secret key
}
```

### Why JWT is Magic

```javascript
// The server creates a token
const token = jwt.sign({ userId: 42, name: 'John' }, 'secret-key')

// Later, ANY server can verify it's real without calling database!
const user = jwt.verify(token, 'secret-key')
console.log(user) // { userId: 42, name: 'John', iat: ..., exp: ... }
```

**The magic:** The server doesn't need to remember anything! The token contains everything needed.

## Where to Store Tokens on Frontend

### Option 1: localStorage (Like Your Wallet)

```javascript
// After login
const response = await fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'john', password: 'secret' })
})

const data = await response.json()
localStorage.setItem('token', data.token) // Put token in wallet

// Using token for requests
const token = localStorage.getItem('token') // Get token from wallet
const response = await fetch('/profile', {
  headers: {
    'Authorization': `Bearer ${token}` // Show your ID card
  }
})
```

**Pros:**
- Simple to use
- Survives browser restart
- You control when to delete it

**Cons:**
- JavaScript can access it (dangerous if site has XSS attacks)
- Shared across all tabs

### Option 2: sessionStorage (Like a Temporary Badge)

```javascript
// Same as localStorage, but disappears when browser closes
sessionStorage.setItem('token', data.token)
const token = sessionStorage.getItem('token')
```

**Pros:**
- More secure (disappears when browser closes)
- Separate for each tab

**Cons:**
- User has to log in every time they open browser

### Option 3: Cookies (Like Automatic ID Card)

```javascript
// Server sets cookie
app.post('/login', (req, res) => {
  const token = jwt.sign({ userId: 42 }, SECRET)
  
  res.cookie('token', token, {
    httpOnly: true,    // JavaScript can't access it (more secure!)
    secure: true,      // Only send over HTTPS
    sameSite: 'strict', // Protection against CSRF attacks
    maxAge: 3600000    // 1 hour
  })
  
  res.json({ message: 'Logged in!' })
})

// Browser automatically sends cookie with every request!
app.get('/profile', (req, res) => {
  const token = req.cookies.token // Cookie automatically sent
  
  try {
    const user = jwt.verify(token, SECRET)
    res.json({ user })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})
```

**Frontend doesn't need to do anything!** Browser automatically includes cookies.

**Pros:**
- Most secure (httpOnly cookies can't be accessed by JavaScript)
- Automatic (no code needed on frontend)
- Protected against XSS attacks

**Cons:**
- Vulnerable to CSRF attacks (but `sameSite` helps)
- Less flexible

## Password Reset Flow Explained

Imagine you lost your house key:

1. **You call a locksmith** → Request password reset
2. **Locksmith verifies you live there** → Check email address exists
3. **Locksmith gives you a temporary key** → Send reset token to email
4. **You use temporary key to get in** → Click link in email
5. **You make a new permanent key** → Set new password
6. **Temporary key stops working** → Reset token expires

### Step-by-Step Implementation

```javascript
const crypto = require('crypto')

// Step 1: User requests password reset
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists (security!)
      return res.json({ message: 'If email exists, reset link sent' })
    }
    
    // Create temporary key (reset token)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = Date.now() + 3600000 // 1 hour from now
    
    // Save temporary key to database
    user.resetToken = resetToken
    user.resetExpires = resetExpires
    await user.save()
    
    // Send email with magic link
    const resetLink = `https://yoursite.com/reset-password?token=${resetToken}`
    await sendEmail(email, 'Password Reset', `Click here: ${resetLink}`)
    
    res.json({ message: 'If email exists, reset link sent' })
    
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Step 2: User clicks link in email
app.get('/reset-password', async (req, res) => {
  const { token } = req.query
  
  // Check if temporary key is valid
  const user = await User.findOne({
    resetToken: token,
    resetExpires: { $gt: Date.now() } // Token not expired
  })
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }
  
  // Show password reset form
  res.json({ message: 'Token valid, show reset form', token })
})

// Step 3: User submits new password
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body
  
  // Find user with valid temporary key
  const user = await User.findOne({
    resetToken: token,
    resetExpires: { $gt: Date.now() }
  })
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }
  
  // Set new password
  user.password = await bcrypt.hash(newPassword, 10)
  user.resetToken = undefined // Destroy temporary key
  user.resetExpires = undefined
  await user.save()
  
  res.json({ message: 'Password reset successful' })
})
```

### Frontend Password Reset Flow

```javascript
// Step 1: Request reset
const requestReset = async (email) => {
  const response = await fetch('/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  
  const data = await response.json()
  alert(data.message) // "Check your email"
}

// Step 2: User clicks email link, arrives at reset page
const checkResetToken = async (token) => {
  const response = await fetch(`/reset-password?token=${token}`)
  
  if (response.ok) {
    // Show password reset form
    showResetForm(token)
  } else {
    alert('Invalid or expired reset link')
  }
}

// Step 3: Submit new password
const resetPassword = async (token, newPassword) => {
  const response = await fetch('/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  })
  
  const data = await response.json()
  if (response.ok) {
    alert('Password reset successful!')
    // Redirect to login page
  } else {
    alert(data.error)
  }
}
```

## Complete Authentication System Example

### Backend Setup

```javascript
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParser())

const SECRET = process.env.JWT_SECRET || 'your-secret-key'
const users = [] // In real app, use database

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  // Try to get token from different places
  let token = req.cookies.token || // From cookie
              req.headers.authorization?.split(' ')[1] // From Authorization header
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }
  
  try {
    const user = jwt.verify(token, SECRET)
    req.user = user // Add user info to request
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' })
  }
}

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' })
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    }
    users.push(user)
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user.id, username: user.username, email: user.email }
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        email: user.email 
      },
      SECRET,
      { expiresIn: '24h' }
    )
    
    // Send token as cookie (secure option)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
      token // Also send in response body for localStorage option
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
})

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'This is your profile',
    user: req.user
  })
})

// Check if user is authenticated
app.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

app.listen(3000, () => {
  console.log('Auth server running on port 3000')
})
```

### Frontend Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Authentication Example</title>
</head>
<body>
    <div id="auth-forms">
        <!-- Login Form -->
        <form id="login-form">
            <h2>Login</h2>
            <input type="email" id="login-email" placeholder="Email" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        
        <!-- Register Form -->
        <form id="register-form">
            <h2>Register</h2>
            <input type="text" id="register-username" placeholder="Username" required>
            <input type="email" id="register-email" placeholder="Email" required>
            <input type="password" id="register-password" placeholder="Password" required>
            <button type="submit">Register</button>
        </form>
    </div>
    
    <div id="user-info" style="display: none;">
        <h2>Welcome!</h2>
        <div id="user-details"></div>
        <button id="logout-btn">Logout</button>
        <button id="profile-btn">Get Profile</button>
    </div>

    <script>
        // Check if user is already logged in
        window.addEventListener('load', checkAuth)

        async function checkAuth() {
            try {
                const response = await fetch('/me')
                if (response.ok) {
                    const data = await response.json()
                    showUserInfo(data.user)
                } else {
                    showAuthForms()
                }
            } catch (error) {
                showAuthForms()
            }
        }

        // Login
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const email = document.getElementById('login-email').value
            const password = document.getElementById('login-password').value
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                })
                
                const data = await response.json()
                
                if (response.ok) {
                    // Option 1: Store in localStorage
                    localStorage.setItem('token', data.token)
                    
                    alert('Login successful!')
                    showUserInfo(data.user)
                } else {
                    alert(data.error)
                }
            } catch (error) {
                alert('Login failed')
            }
        })

        // Register
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const username = document.getElementById('register-username').value
            const email = document.getElementById('register-email').value
            const password = document.getElementById('register-password').value
            
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                })
                
                const data = await response.json()
                
                if (response.ok) {
                    alert('Registration successful! Please login.')
                } else {
                    alert(data.error)
                }
            } catch (error) {
                alert('Registration failed')
            }
        })

        // Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                await fetch('/logout', { method: 'POST' })
                localStorage.removeItem('token') // Clear localStorage too
                showAuthForms()
            } catch (error) {
                alert('Logout failed')
            }
        })

        // Get profile (protected route)
        document.getElementById('profile-btn').addEventListener('click', async () => {
            try {
                // Option 1: Send token in Authorization header
                const token = localStorage.getItem('token')
                const response = await fetch('/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                // Option 2: Cookie is sent automatically, no header needed
                // const response = await fetch('/profile')
                
                const data = await response.json()
                
                if (response.ok) {
                    alert(`Profile: ${JSON.stringify(data.user, null, 2)}`)
                } else {
                    alert(data.error)
                }
            } catch (error) {
                alert('Failed to get profile')
            }
        })

        function showAuthForms() {
            document.getElementById('auth-forms').style.display = 'block'
            document.getElementById('user-info').style.display = 'none'
        }

        function showUserInfo(user) {
            document.getElementById('auth-forms').style.display = 'none'
            document.getElementById('user-info').style.display = 'block'
            document.getElementById('user-details').innerHTML = `
                <p>ID: ${user.userId}</p>
                <p>Username: ${user.username}</p>
                <p>Email: ${user.email}</p>
            `
        }
    </script>
</body>
</html>
```

## Security Best Practices

### 1. Password Hashing
```javascript
// ❌ NEVER store plain text passwords
const user = { password: 'secret123' }

// ✅ Always hash passwords
const hashedPassword = await bcrypt.hash('secret123', 10)
const user = { password: hashedPassword }
```

### 2. Secure JWT Secrets
```javascript
// ❌ Weak secret
const SECRET = 'secret'

// ✅ Strong secret (use environment variable)
const SECRET = process.env.JWT_SECRET // Long random string
```

### 3. Token Expiration
```javascript
// ✅ Always set expiration
const token = jwt.sign(payload, SECRET, { expiresIn: '1h' })
```

### 4. Secure Cookies
```javascript
// ✅ Secure cookie settings
res.cookie('token', token, {
  httpOnly: true,    // JavaScript can't access
  secure: true,      // HTTPS only
  sameSite: 'strict' // CSRF protection
})
```

### 5. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, try again later'
})

app.post('/login', loginLimiter, loginHandler)
```

## Summary: When to Use What

### Use Sessions When:
- Simple applications
- Server-side rendered apps
- You need server-side session data

### Use JWT When:
- APIs and SPAs
- Microservices
- Mobile apps
- Need stateless authentication

### Store Tokens In:
- **Cookies**: Most secure, automatic
- **localStorage**: Persistent, manual control
- **sessionStorage**: Temporary, tab-specific

### Password Reset:
- Generate random token
- Store in database with expiration
- Send via email
- Verify token before allowing reset

Remember: Security is like layers of armor - use multiple techniques together for best protection! 🛡️