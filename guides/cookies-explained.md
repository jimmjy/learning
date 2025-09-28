# Cookies - Explained Like You're 5

## The Big Picture: What are Cookies?

Imagine you're going to your favorite restaurant every week. Without cookies, this would happen:

**Every visit:**
- Waiter: "Welcome! What's your name?"
- You: "John"
- Waiter: "What do you usually like?"
- You: "Pepperoni pizza, no onions"
- Waiter: "Do you have any allergies?"
- You: "Yes, shellfish"

**With cookies, it's like the waiter has a notepad:**
- First visit: Waiter writes down "John - pepperoni pizza, no onions, shellfish allergy"
- Next visit: "Hi John! The usual pepperoni pizza?"
- You: "Perfect!"

**Cookies are the web's memory system** - they let websites remember things about you between visits.

## What Cookies Actually Are

Cookies are small text files (max 4KB each) that websites store on your computer. Think of them as sticky notes:

```
Website: "Hey browser, please remember this about the user"
Browser: "Sure! I'll write it down and remind you next time"

Cookie content example:
sessionId=abc123xyz789
theme=dark
language=en
lastVisit=2024-01-15
```

## How Cookies Work: The Complete Flow

### Setting a Cookie (Website → Browser)

```http
# Server sends this in response headers:
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure
Set-Cookie: theme=dark; Max-Age=2592000; Path=/
Content-Type: text/html

<html>Your page content...</html>
```

**What happens:**
1. Website says: "Browser, please remember these things"
2. Browser says: "Got it! I'll save these sticky notes"
3. Browser stores the cookies on your computer

### Sending Cookies Back (Browser → Website)

```http
# Browser automatically includes cookies in next request:
GET /dashboard HTTP/1.1
Host: example.com
Cookie: sessionId=abc123; theme=dark
User-Agent: Mozilla/5.0...
```

**What happens:**
1. You visit the same website again
2. Browser says: "Oh, I have sticky notes for this site!"
3. Browser automatically sends ALL relevant cookies
4. Website says: "Ah, it's John! Dark theme, session abc123"

## Types of Cookies and Their Uses

### 1. Session Cookies (Temporary Memory)
**What they do:** Remember things just for your current visit
**When they disappear:** When you close your browser

```javascript
// Set session cookie (no expiration)
res.cookie('cartItems', '3')

// Browser deletes this when you close the tab
```

**Real-world examples:**
- Shopping cart contents
- "Are you logged in right now?"
- Temporary preferences

### 2. Persistent Cookies (Long-term Memory)
**What they do:** Remember things for days, weeks, or months
**When they disappear:** On a specific date or after a set time

```javascript
// Remember for 30 days
res.cookie('theme', 'dark', { 
  maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days in milliseconds
})

// Remember until specific date
res.cookie('username', 'john', { 
  expires: new Date('2024-12-31') 
})
```

**Real-world examples:**
- "Remember me" login
- Language preference
- Theme (dark/light mode)
- "Don't show this popup again"

### 3. First-Party Cookies (Your Website's Memory)
**What they are:** Cookies set by the website you're actually visiting

```javascript
// You're on myshop.com, and myshop.com sets a cookie
// This is a first-party cookie
res.cookie('userId', '12345')
```

### 4. Third-Party Cookies (Other Websites' Spies)
**What they are:** Cookies set by other websites embedded in the current page

```html
<!-- You're on myshop.com, but this ad is from adnetwork.com -->
<img src="https://adnetwork.com/track.gif">
<!-- adnetwork.com can set cookies to track you across websites -->
```

**Why they're controversial:**
- They track you across different websites
- Build profiles of your browsing habits
- Used for targeted advertising
- Many browsers now block them by default

## Cookie Attributes: The Rules for Memory

### Path - Where the Memory Applies

```javascript
// Cookie only sent for /admin pages
res.cookie('adminToken', 'xyz789', { path: '/admin' })

// Cookie sent for entire website
res.cookie('theme', 'dark', { path: '/' })
```

**Examples:**
- `path=/admin` → Only available on `/admin/dashboard`, `/admin/users`
- `path=/` → Available everywhere on your website
- `path=/blog` → Only available on blog pages

### Domain - Which Websites Can Access

```javascript
// Only example.com can access
res.cookie('sessionId', 'abc123', { domain: 'example.com' })

// All subdomains can access
res.cookie('theme', 'dark', { domain: '.example.com' })
```

**Examples:**
- `domain=shop.com` → Only shop.com
- `domain=.shop.com` → shop.com, mobile.shop.com, api.shop.com

### HttpOnly - JavaScript Can't Touch

```javascript
// JavaScript CANNOT access this cookie (secure!)
res.cookie('sessionToken', 'secret123', { httpOnly: true })

// JavaScript CAN access this cookie
res.cookie('theme', 'dark', { httpOnly: false })
```

**Why HttpOnly matters:**
```javascript
// ❌ If cookie is NOT HttpOnly, hackers can steal it:
document.cookie // "sessionToken=secret123; theme=dark"
// Hacker script: send sessionToken to evil server

// ✅ If cookie IS HttpOnly:
document.cookie // "theme=dark" (sessionToken is hidden)
```

### Secure - Only Over HTTPS

```javascript
// Only sent over encrypted connections
res.cookie('creditCard', 'encrypted-data', { secure: true })
```

**What happens:**
- `secure: true` + HTTP → Cookie not sent (protection)
- `secure: true` + HTTPS → Cookie sent normally
- `secure: false` → Cookie sent over HTTP and HTTPS

### SameSite - Protection Against Attacks

```javascript
// Strict: Only sent with requests from same website
res.cookie('sessionId', 'abc123', { sameSite: 'strict' })

// Lax: Sent with same-site requests and top-level navigation
res.cookie('theme', 'dark', { sameSite: 'lax' })

// None: Sent with all requests (requires Secure)
res.cookie('trackingId', 'xyz789', { 
  sameSite: 'none', 
  secure: true 
})
```

**Real-world scenarios:**

**Strict:**
```
You're on mybank.com and click a link to mybank.com/transfer
✅ Cookie sent - same website

Evil site has <img src="mybank.com/transfer-money">
❌ Cookie NOT sent - protects against attacks
```

**Lax:**
```
You're on google.com and click link to myshop.com
✅ Cookie sent - normal navigation

Evil site has <img src="myshop.com/buy-item">
❌ Cookie NOT sent - still protected
```

**None:**
```
Always sent (dangerous unless you know what you're doing)
```

## Working with Cookies: Code Examples

### Backend: Setting Cookies (Express.js)

```javascript
const express = require('express')
const app = express()

// Basic cookie
app.get('/login', (req, res) => {
  res.cookie('username', 'john')
  res.send('Cookie set!')
})

// Cookie with all options
app.get('/secure-login', (req, res) => {
  res.cookie('sessionId', 'abc123xyz789', {
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    httpOnly: true,               // Can't access with JavaScript
    secure: true,                 // Only over HTTPS
    sameSite: 'strict',          // CSRF protection
    path: '/',                   // Available site-wide
    domain: '.mysite.com'        // Available on all subdomains
  })
  
  res.json({ message: 'Secure session started' })
})

// Multiple cookies at once
app.get('/preferences', (req, res) => {
  res.cookie('theme', 'dark')
  res.cookie('language', 'en')
  res.cookie('notifications', 'enabled')
  res.send('Preferences saved!')
})

// Clear a cookie
app.get('/logout', (req, res) => {
  res.clearCookie('sessionId')
  // Or set it to expire immediately:
  res.cookie('sessionId', '', { maxAge: 0 })
  res.send('Logged out!')
})
```

### Backend: Reading Cookies

```javascript
// Install: npm install cookie-parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.get('/dashboard', (req, res) => {
  // Read all cookies
  console.log('All cookies:', req.cookies)
  // { sessionId: 'abc123', theme: 'dark', language: 'en' }
  
  // Read specific cookie
  const sessionId = req.cookies.sessionId
  const theme = req.cookies.theme || 'light'  // Default value
  
  if (!sessionId) {
    return res.status(401).send('Please log in')
  }
  
  res.send(`Welcome back! Theme: ${theme}`)
})

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  const sessionId = req.cookies.sessionId
  
  if (!sessionId) {
    return res.redirect('/login')
  }
  
  // Verify session in database
  if (isValidSession(sessionId)) {
    next()  // Continue to protected route
  } else {
    res.clearCookie('sessionId')
    res.redirect('/login')
  }
}

app.get('/profile', requireAuth, (req, res) => {
  res.send('Your profile page')
})
```

### Frontend: Working with Cookies (JavaScript)

```javascript
// Reading cookies (only non-HttpOnly ones!)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

// Usage
const theme = getCookie('theme') || 'light'
const language = getCookie('language') || 'en'

console.log('Current theme:', theme)

// Setting cookies from JavaScript
function setCookie(name, value, days) {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`
}

// Usage
setCookie('theme', 'dark', 30)  // Remember for 30 days
setCookie('fontSize', 'large', 7)  // Remember for 7 days

// Deleting cookies from JavaScript
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

deleteCookie('theme')
```

### Frontend: Using Cookies in React

```jsx
// Custom hook for cookies
import { useState, useEffect } from 'react'

function useCookie(name, defaultValue) {
  const [value, setValue] = useState(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const cookie = getCookie(name)
      return cookie ? cookie : defaultValue
    }
    return defaultValue
  })
  
  const setCookieValue = (newValue, days = 30) => {
    setValue(newValue)
    setCookie(name, newValue, days)
  }
  
  return [value, setCookieValue]
}

// Using the hook
function ThemeToggle() {
  const [theme, setTheme] = useCookie('theme', 'light')
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  useEffect(() => {
    document.body.className = theme
  }, [theme])
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  )
}

// Login component that sets auth cookie
function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  
  const handleLogin = async (e) => {
    e.preventDefault()
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Important: include cookies
      body: JSON.stringify(credentials)
    })
    
    if (response.ok) {
      // Server sets HttpOnly cookie automatically
      window.location.href = '/dashboard'
    }
  }
  
  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={credentials.email}
        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        placeholder="Email"
      />
      <input 
        type="password" 
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

## Cookie Security: The Good, Bad, and Ugly

### The Good: Legitimate Uses

```javascript
// ✅ Session management
res.cookie('sessionId', generateSecureId(), {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})

// ✅ User preferences
res.cookie('theme', 'dark', { 
  maxAge: 30 * 24 * 60 * 60 * 1000 
})

// ✅ Shopping cart
res.cookie('cartItems', JSON.stringify(cart), {
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
})

// ✅ Language preference
res.cookie('language', 'es', {
  maxAge: 365 * 24 * 60 * 60 * 1000  // 1 year
})
```

### The Bad: Security Vulnerabilities

```javascript
// ❌ DANGEROUS: Sensitive data without protection
res.cookie('password', userPassword)  // Never do this!

// ❌ DANGEROUS: Session without security
res.cookie('sessionId', 'abc123')  // Missing httpOnly, secure

// ❌ DANGEROUS: Accessible to JavaScript
res.cookie('authToken', token, { httpOnly: false })

// ✅ SECURE: Proper session cookie
res.cookie('sessionId', secureToken, {
  httpOnly: true,    // JavaScript can't access
  secure: true,      // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 3600000    // 1 hour expiration
})
```

### The Ugly: Privacy Concerns

```javascript
// Third-party tracking cookies (being phased out)
// These track users across multiple websites

// ❌ Tracking cookie from ad network
res.cookie('trackingId', userId, {
  domain: '.adnetwork.com',
  maxAge: 365 * 24 * 60 * 60 * 1000,  // 1 year
  sameSite: 'none',
  secure: true
})

// Browser fingerprinting (alternative to cookies)
// Tracks users without cookies using browser characteristics
```

## Cookie Laws and Compliance

### GDPR (Europe) and Cookie Consent

```javascript
// Legal requirement: Ask before setting non-essential cookies

// ✅ Essential cookies (no consent needed)
res.cookie('sessionId', sessionId, { httpOnly: true })
res.cookie('language', 'en')  // Functionality cookie

// ❌ Non-essential cookies (need consent)
res.cookie('analytics', userId)    // Need consent
res.cookie('marketing', trackingId) // Need consent

// Cookie consent implementation
function CookieConsent() {
  const [consent, setConsent] = useState(null)
  
  const acceptAll = () => {
    setConsent('all')
    setCookie('analytics', 'enabled')
    setCookie('marketing', 'enabled')
    setCookie('cookieConsent', 'all', 365)
  }
  
  const acceptEssential = () => {
    setConsent('essential')
    setCookie('cookieConsent', 'essential', 365)
  }
  
  if (consent !== null) return null
  
  return (
    <div className="cookie-banner">
      <p>We use cookies to improve your experience.</p>
      <button onClick={acceptAll}>Accept All</button>
      <button onClick={acceptEssential}>Essential Only</button>
    </div>
  )
}
```

## Common Cookie Patterns and Solutions

### 1. Remember Me Login

```javascript
// Backend
app.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body
  
  const user = await authenticateUser(email, password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const sessionId = generateSessionId()
  
  if (rememberMe) {
    // Long-lived session (30 days)
    res.cookie('sessionId', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })
  } else {
    // Session cookie (browser close)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })
  }
  
  res.json({ message: 'Login successful' })
})

// Frontend
function LoginForm() {
  const [rememberMe, setRememberMe] = useState(false)
  
  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <label>
        <input 
          type="checkbox" 
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me for 30 days
      </label>
      <button type="submit">Login</button>
    </form>
  )
}
```

### 2. Shopping Cart Persistence

```javascript
// Backend API for cart
app.get('/api/cart', (req, res) => {
  const cartData = req.cookies.cart
  const cart = cartData ? JSON.parse(cartData) : []
  res.json({ items: cart })
})

app.post('/api/cart/add', (req, res) => {
  const cartData = req.cookies.cart
  const cart = cartData ? JSON.parse(cartData) : []
  
  cart.push(req.body.item)
  
  res.cookie('cart', JSON.stringify(cart), {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: '/',
    sameSite: 'lax'
  })
  
  res.json({ items: cart })
})

// Frontend cart hook
function useCart() {
  const [cart, setCart] = useState([])
  
  useEffect(() => {
    // Load cart from cookie on page load
    const cartCookie = getCookie('cart')
    if (cartCookie) {
      setCart(JSON.parse(cartCookie))
    }
  }, [])
  
  const addToCart = (item) => {
    const newCart = [...cart, item]
    setCart(newCart)
    setCookie('cart', JSON.stringify(newCart), 7)
  }
  
  return { cart, addToCart }
}
```

### 3. User Preferences

```javascript
// Preferences manager
class UserPreferences {
  constructor() {
    this.preferences = this.load()
  }
  
  load() {
    const prefs = getCookie('userPrefs')
    return prefs ? JSON.parse(prefs) : {
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
      notifications: true
    }
  }
  
  save() {
    setCookie('userPrefs', JSON.stringify(this.preferences), 365)
  }
  
  set(key, value) {
    this.preferences[key] = value
    this.save()
    this.notify(key, value)
  }
  
  get(key) {
    return this.preferences[key]
  }
  
  notify(key, value) {
    // Trigger UI updates
    window.dispatchEvent(new CustomEvent('preferencesChanged', {
      detail: { key, value }
    }))
  }
}

// Usage
const prefs = new UserPreferences()

// React component
function ThemeSelector() {
  const [theme, setTheme] = useState(prefs.get('theme'))
  
  useEffect(() => {
    const handlePrefsChange = (e) => {
      if (e.detail.key === 'theme') {
        setTheme(e.detail.value)
      }
    }
    
    window.addEventListener('preferencesChanged', handlePrefsChange)
    return () => window.removeEventListener('preferencesChanged', handlePrefsChange)
  }, [])
  
  const changeTheme = (newTheme) => {
    prefs.set('theme', newTheme)
    document.body.className = newTheme
  }
  
  return (
    <select value={theme} onChange={(e) => changeTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="auto">Auto</option>
    </select>
  )
}
```

### 4. CSRF Protection with Cookies

```javascript
// Backend: Generate CSRF token
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

app.use(csrfProtection)

app.get('/form', (req, res) => {
  // Send CSRF token to client
  res.render('form', { csrfToken: req.csrfToken() })
})

app.post('/submit', (req, res) => {
  // CSRF middleware automatically validates token
  res.send('Form submitted successfully')
})

// Frontend: Include CSRF token
function SecureForm() {
  const [csrfToken, setCsrfToken] = useState('')
  
  useEffect(() => {
    // Get CSRF token from server
    fetch('/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
  }, [])
  
  const handleSubmit = async (formData) => {
    await fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        ...formData,
        _csrf: csrfToken
      })
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {/* Other form fields */}
    </form>
  )
}
```

## Cookie Debugging and Tools

### Browser Developer Tools

```javascript
// In browser console:

// View all cookies for current domain
document.cookie

// View cookies in Application/Storage tab
// Shows: Name, Value, Domain, Path, Expires, HttpOnly, Secure, SameSite

// Clear all cookies for domain
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

### Server-Side Cookie Debugging

```javascript
// Express middleware to log all cookies
app.use((req, res, next) => {
  console.log('📍 Route:', req.path)
  console.log('🍪 Cookies received:', req.cookies)
  
  // Log cookie changes
  const originalCookie = res.cookie
  res.cookie = function(name, value, options) {
    console.log(`🍪 Setting cookie: ${name}=${value}`, options)
    return originalCookie.call(this, name, value, options)
  }
  
  next()
})

// Cookie inspector route
app.get('/debug/cookies', (req, res) => {
  res.json({
    received: req.cookies,
    headers: req.headers.cookie,
    userAgent: req.headers['user-agent']
  })
})
```

### Testing Cookies

```javascript
// Jest test for cookie functionality
const request = require('supertest')
const app = require('../app')

describe('Cookie handling', () => {
  test('should set session cookie on login', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'password' })
    
    expect(response.status).toBe(200)
    expect(response.headers['set-cookie']).toBeDefined()
    
    const cookies = response.headers['set-cookie']
    const sessionCookie = cookies.find(cookie => cookie.startsWith('sessionId='))
    expect(sessionCookie).toContain('HttpOnly')
    expect(sessionCookie).toContain('Secure')
  })
  
  test('should maintain session across requests', async () => {
    // Login and get cookies
    const loginResponse = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'password' })
    
    const cookies = loginResponse.headers['set-cookie']
    
    // Use cookies in next request
    const dashboardResponse = await request(app)
      .get('/dashboard')
      .set('Cookie', cookies)
    
    expect(dashboardResponse.status).toBe(200)
    expect(dashboardResponse.text).toContain('Welcome')
  })
})
```

## Modern Cookie Alternatives

### 1. Local Storage vs Cookies

```javascript
// Cookies
// ✅ Automatically sent with requests
// ✅ Can be HttpOnly (secure)
// ❌ Limited to 4KB
// ❌ Sent with every request (overhead)

// Local Storage
// ✅ Larger storage (5-10MB)
// ✅ Doesn't send with requests automatically
// ❌ Always accessible to JavaScript
// ❌ Not sent automatically (need manual handling)

// When to use cookies:
res.cookie('sessionId', sessionId, { httpOnly: true })  // Authentication

// When to use localStorage:
localStorage.setItem('userPreferences', JSON.stringify(prefs))  // Large data

// Hybrid approach: Best of both
localStorage.setItem('userData', JSON.stringify(userData))  // Large data
res.cookie('sessionId', sessionId, { httpOnly: true })      // Authentication
```

### 2. Session Storage vs Cookies

```javascript
// Session Storage (tab-specific, temporary)
sessionStorage.setItem('currentForm', JSON.stringify(formData))

// Cookies (domain-wide, persistent)
res.cookie('theme', 'dark', { maxAge: 30 * 24 * 60 * 60 * 1000 })

// Use session storage for:
// - Temporary form data
// - Tab-specific state
// - Single-session data

// Use cookies for:
// - Authentication
// - Cross-tab preferences
// - Server-side needed data
```

### 3. Modern Authentication Patterns

```javascript
// Traditional cookie-based auth
app.post('/login', (req, res) => {
  const sessionId = generateSession()
  res.cookie('sessionId', sessionId, { httpOnly: true })
  res.json({ success: true })
})

// Modern token-based auth (still uses cookies for storage)
app.post('/login', (req, res) => {
  const accessToken = generateJWT(user, '15m')
  const refreshToken = generateJWT(user, '7d')
  
  // Store refresh token in HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  })
  
  // Send access token in response body
  res.json({ accessToken })
})

// Client stores access token in memory, refresh token in cookie
class AuthManager {
  constructor() {
    this.accessToken = null
  }
  
  async login(credentials) {
    const response = await fetch('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      credentials: 'include'  // Include refresh token cookie
    })
    
    const { accessToken } = await response.json()
    this.accessToken = accessToken  // Store in memory
  }
  
  async makeRequest(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      },
      credentials: 'include'
    })
  }
}
```

## Cookie Best Practices Summary

### Security Checklist

```javascript
// ✅ Essential security settings
res.cookie('sessionId', sessionId, {
  httpOnly: true,        // Prevent XSS attacks
  secure: true,          // HTTPS only in production
  sameSite: 'strict',    // Prevent CSRF attacks
  maxAge: 3600000        // Set reasonable expiration
})

// ✅ Environment-specific settings
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  domain: process.env.NODE_ENV === 'production' ? '.mysite.com' : undefined
}

// ✅ Never store sensitive data
// ❌ Don't do this:
res.cookie('password', userPassword)
res.cookie('creditCard', cardNumber)

// ✅ Do this instead:
res.cookie('sessionId', secureRandomId)
// Store sensitive data server-side, linked by session ID
```

### Performance Tips

```javascript
// ✅ Minimize cookie size
res.cookie('theme', 'dark')  // Good: 4 bytes
res.cookie('userId', '12345')  // Good: 5 bytes

// ❌ Avoid large cookies
res.cookie('userData', JSON.stringify(largeObject))  // Bad: could be KBs

// ✅ Use appropriate expiration
res.cookie('sessionId', id, { maxAge: 3600000 })      // 1 hour
res.cookie('theme', 'dark', { maxAge: 31536000000 })  // 1 year

// ✅ Clean up unused cookies
res.clearCookie('oldCookie')
res.cookie('expiredCookie', '', { maxAge: 0 })
```

### Privacy and Compliance

```javascript
// ✅ Cookie categories for compliance
const cookieTypes = {
  essential: ['sessionId', 'csrfToken'],      // No consent needed
  functional: ['theme', 'language'],          // Functionality consent
  analytics: ['analyticsId'],                 // Analytics consent
  marketing: ['advertisingId']                // Marketing consent
}

// ✅ Conditional cookie setting
function setCookieWithConsent(name, value, category, options) {
  const consent = getUserConsent()
  
  if (category === 'essential' || consent[category]) {
    res.cookie(name, value, options)
  }
}
```

## Summary: Cookie Master Checklist

### When to Use Cookies
- ✅ **Authentication sessions** (with httpOnly)
- ✅ **User preferences** (theme, language)
- ✅ **Shopping cart** (temporary storage)
- ✅ **CSRF protection** (security tokens)
- ✅ **"Remember me"** functionality

### When NOT to Use Cookies
- ❌ **Large data storage** (use localStorage)
- ❌ **Sensitive information** (passwords, credit cards)
- ❌ **Temporary UI state** (use component state)
- ❌ **Tab-specific data** (use sessionStorage)

### Security Essentials
1. **Always use `httpOnly: true`** for authentication
2. **Always use `secure: true`** in production
3. **Always use `sameSite: 'strict'`** for sensitive cookies
4. **Set reasonable expiration times**
5. **Clear cookies on logout**

### Modern Best Practices
- Use **HTTP-only cookies** for authentication tokens
- Use **localStorage** for large, non-sensitive data
- Use **sessionStorage** for temporary, tab-specific data
- Implement **proper cookie consent** for compliance
- Regular **security audits** of cookie usage

Remember: Cookies are like a waiter's notepad - they help websites remember you, but just like you wouldn't want a waiter writing down your credit card number, be careful what you let websites remember! 🍪📝