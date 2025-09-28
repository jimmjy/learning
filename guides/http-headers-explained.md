# HTTP Headers - Explained Like You're 5

## The Big Picture: What are HTTP Headers?

Imagine HTTP requests and responses as letters sent through the mail. Every letter has two parts:

1. **The envelope** (HTTP headers) - Contains important delivery information
2. **The letter content** (HTTP body) - The actual message

**Headers are like the envelope information:**
- Who is sending it (User-Agent)
- Where it's going (Host)
- What type of content is inside (Content-Type)
- How to handle the letter (Cache-Control)
- Security instructions (Authorization)

```http
# A typical HTTP request looks like this:

POST /api/users HTTP/1.1                    ← Request line
Host: api.example.com                        ← 
Content-Type: application/json              ← Headers (the envelope)
Authorization: Bearer abc123                 ← 
Content-Length: 25                          ←
                                            ← Empty line separates headers from body
{"name": "John", "age": 30}                 ← Body (the letter content)
```

## Understanding HTTP Request/Response Flow

### The Complete Conversation

```http
# 1. Client sends request:
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Chrome/91.0)
Accept: application/json
Authorization: Bearer token123
Cookie: sessionId=abc123

# 2. Server responds:
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156
Set-Cookie: sessionId=xyz789; Path=/; HttpOnly
Cache-Control: no-cache
Access-Control-Allow-Origin: https://mysite.com

[{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]
```

Think of it like a restaurant conversation:
- **Request headers**: "Hi, I'd like a table for 2, I'm vegetarian, I'll pay with credit card"
- **Response headers**: "Table 5 is ready, here's your receipt, we're open until 10pm"
- **Request/Response body**: The actual food order and the meal

## Request Headers: What Client Sends

### Essential Request Headers

#### Host
"What website am I trying to reach?"

```http
Host: api.example.com
```

**Why it's needed:** One server can host multiple websites. The `Host` header tells the server which website you want.

```javascript
// These requests go to the same IP but different websites:
fetch('http://192.168.1.100/api/users', {
  headers: { 'Host': 'site1.com' }
})

fetch('http://192.168.1.100/api/users', {
  headers: { 'Host': 'site2.com' }
})
```

#### User-Agent
"What browser/app am I using?"

```http
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
```

**Real examples:**
```http
# Chrome on Mac
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36

# Mobile Safari
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1

# Node.js fetch
User-Agent: node-fetch/1.0 (+https://github.com/bitinn/node-fetch)

# Custom app
User-Agent: MyApp/1.0
```

**Why servers care:**
```javascript
// Server can serve different content based on device
app.get('/api/data', (req, res) => {
  const userAgent = req.headers['user-agent']
  
  if (userAgent.includes('Mobile')) {
    res.json({ version: 'mobile', features: ['basic'] })
  } else {
    res.json({ version: 'desktop', features: ['basic', 'advanced'] })
  }
})
```

#### Accept
"What types of response can I understand?"

```http
Accept: application/json                    # I only want JSON
Accept: text/html, application/json         # I prefer HTML, but JSON is ok
Accept: */*                                 # I'll take anything
Accept: image/png, image/jpeg, image/webp   # I want images only
```

**Content negotiation example:**
```javascript
app.get('/api/users', (req, res) => {
  const accept = req.headers.accept
  
  if (accept.includes('application/json')) {
    res.json([{ name: 'John' }])
  } else if (accept.includes('text/html')) {
    res.send('<h1>Users</h1><ul><li>John</li></ul>')
  } else if (accept.includes('text/csv')) {
    res.send('name\nJohn')
  }
})
```

#### Accept-Language
"What languages do I understand?"

```http
Accept-Language: en-US, en;q=0.9, es;q=0.8
```

**Translation:**
- `en-US` - I prefer US English (priority 1.0)
- `en;q=0.9` - Any English is good (priority 0.9)
- `es;q=0.8` - Spanish is okay (priority 0.8)

```javascript
// Server can localize responses
app.get('/api/greeting', (req, res) => {
  const lang = req.headers['accept-language']
  
  if (lang.includes('es')) {
    res.json({ message: 'Hola' })
  } else if (lang.includes('fr')) {
    res.json({ message: 'Bonjour' })
  } else {
    res.json({ message: 'Hello' })
  }
})
```

#### Authorization
"Here's my ID to prove who I am"

```http
# Different auth types:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    # JWT Token
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=                      # Username:password (base64)
Authorization: API-Key abc123                                      # Custom API key
```

**Usage examples:**
```javascript
// JWT Bearer token
fetch('/api/protected', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})

// Basic auth
const credentials = btoa('username:password')  // base64 encode
fetch('/api/data', {
  headers: {
    'Authorization': 'Basic ' + credentials
  }
})

// API Key
fetch('/api/data', {
  headers: {
    'Authorization': 'API-Key my-secret-key'
  }
})
```

#### Content-Type (for POST/PUT requests)
"What type of data am I sending?"

```http
Content-Type: application/json              # JSON data
Content-Type: application/x-www-form-urlencoded  # Form data
Content-Type: multipart/form-data           # File uploads
Content-Type: text/plain                    # Plain text
```

**Examples:**
```javascript
// JSON data
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John' })
})

// Form data
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'name=John&email=john@example.com'
})

// File upload
const formData = new FormData()
formData.append('file', fileInput.files[0])
fetch('/api/upload', {
  method: 'POST',
  body: formData  // Don't set Content-Type - browser sets it automatically
})
```

#### Content-Length
"How much data am I sending?"

```http
Content-Length: 25     # Body is 25 bytes
```

**Usually set automatically:**
```javascript
// Browser/Node.js calculates this for you
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })  // Browser sets Content-Length: 17
})
```

### Custom Request Headers

```http
# API Keys
X-API-Key: your-api-key-here

# Request IDs for tracking
X-Request-ID: req-123-456-789

# Client version
X-Client-Version: 1.2.3

# Feature flags
X-Features: beta-ui,new-dashboard

# Custom business logic
X-Tenant-ID: company-abc
X-User-Role: admin
```

**Usage examples:**
```javascript
fetch('/api/data', {
  headers: {
    'X-API-Key': 'your-api-key',
    'X-Request-ID': generateRequestId(),
    'X-Client-Version': '1.2.3'
  }
})
```

## Response Headers: What Server Sends

### Essential Response Headers

#### Content-Type
"What type of data am I sending back?"

```http
Content-Type: application/json              # JSON response
Content-Type: text/html; charset=utf-8      # HTML page
Content-Type: image/png                     # PNG image
Content-Type: application/pdf               # PDF file
Content-Type: text/csv                      # CSV data
```

**Setting in different frameworks:**
```javascript
// Express
res.json({ name: 'John' })                     // Sets Content-Type: application/json
res.send('<h1>Hello</h1>')                     // Sets Content-Type: text/html
res.sendFile('/path/to/image.png')             // Sets Content-Type: image/png

// Manual setting
res.set('Content-Type', 'application/json')
res.send('{"name": "John"}')
```

#### Content-Length
"How much data am I sending?"

```http
Content-Length: 156     # Response body is 156 bytes
```

```javascript
// Usually set automatically
res.json({ name: 'John' })  // Express sets Content-Length automatically

// Manual setting (rarely needed)
const data = JSON.stringify({ name: 'John' })
res.set('Content-Length', Buffer.byteLength(data))
res.send(data)
```

#### Set-Cookie
"Store this information for future requests"

```http
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
Set-Cookie: theme=dark; Max-Age=2592000; Path=/
```

**Breaking down cookie attributes:**
- `sessionId=abc123` - Cookie name and value
- `Path=/` - Available on all paths
- `HttpOnly` - Can't be accessed by JavaScript (security)
- `Secure` - Only sent over HTTPS
- `SameSite=Strict` - Protection against CSRF attacks
- `Max-Age=2592000` - Expires in 30 days

```javascript
// Express cookie setting
res.cookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
})

// Multiple cookies
res.cookie('userId', '42')
res.cookie('theme', 'dark')
res.json({ message: 'Logged in' })
```

#### Cache-Control
"How should this response be cached?"

```http
Cache-Control: no-cache                     # Always check with server
Cache-Control: max-age=3600                 # Cache for 1 hour
Cache-Control: public, max-age=86400        # Cache publicly for 24 hours
Cache-Control: private, no-store            # Don't cache at all
```

**Cache strategies:**
```javascript
// API responses - don't cache
res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
res.json({ users: users })

// Static assets - cache for a long time
res.set('Cache-Control', 'public, max-age=31536000')  // 1 year
res.sendFile('/path/to/logo.png')

// Dynamic content - cache briefly
res.set('Cache-Control', 'public, max-age=300')  // 5 minutes
res.send('<h1>Current time: ' + new Date() + '</h1>')
```

#### ETag
"Fingerprint of this response for caching"

```http
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**How ETags work:**
```javascript
// Server generates ETag based on content
const content = JSON.stringify(users)
const etag = require('crypto').createHash('md5').update(content).digest('hex')

res.set('ETag', etag)

// Client includes ETag in next request
// If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// Server checks if content changed
if (req.headers['if-none-match'] === etag) {
  res.status(304).end()  // Not modified
} else {
  res.json(users)        // Send updated content
}
```

#### Location
"Where to find the newly created resource"

```http
Location: /api/users/123
```

```javascript
// Used with 201 Created or 3xx redirects
app.post('/api/users', (req, res) => {
  const user = createUser(req.body)
  res.status(201)
    .location(`/api/users/${user.id}`)
    .json(user)
})

// Redirects
app.get('/old-page', (req, res) => {
  res.redirect(301, '/new-page')  // Sets Location header automatically
})
```

### Security Headers

#### X-Content-Type-Options
"Don't try to guess the content type"

```http
X-Content-Type-Options: nosniff
```

**Why it matters:**
```javascript
// Without this header, browsers might interpret JSON as HTML
// This could lead to XSS attacks

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  next()
})
```

#### X-Frame-Options
"Don't allow this page to be embedded in frames"

```http
X-Frame-Options: DENY                       # Never allow framing
X-Frame-Options: SAMEORIGIN                 # Only allow same-origin framing
X-Frame-Options: ALLOW-FROM https://example.com  # Allow specific origin
```

```javascript
// Prevent clickjacking attacks
app.use((req, res, next) => {
  res.set('X-Frame-Options', 'DENY')
  next()
})
```

#### X-XSS-Protection
"Enable browser's XSS protection"

```http
X-XSS-Protection: 1; mode=block
```

#### Content-Security-Policy (CSP)
"Rules about what resources this page can load"

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

**CSP directives:**
```javascript
app.use((req, res, next) => {
  res.set('Content-Security-Policy', [
    "default-src 'self'",                    // Only load resources from same origin
    "script-src 'self' https://cdn.js.org", // Scripts from self + CDN
    "style-src 'self' 'unsafe-inline'",     // Styles from self + inline styles
    "img-src 'self' data: https:",          // Images from self, data URLs, HTTPS
    "connect-src 'self' https://api.example.com"  // AJAX to self + API
  ].join('; '))
  next()
})
```

#### Strict-Transport-Security (HSTS)
"Always use HTTPS for this site"

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

```javascript
// Force HTTPS for 1 year
app.use((req, res, next) => {
  if (req.secure) {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})
```

### CORS Headers (Covered in CORS guide)

```http
Access-Control-Allow-Origin: https://mysite.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Custom Response Headers

```http
# Rate limiting info
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200

# API version
X-API-Version: 2.1

# Server info
X-Powered-By: Express
X-Response-Time: 123ms

# Business logic
X-Total-Count: 150
X-Page-Count: 15
X-Current-Page: 1
```

## Working with Headers in Different Contexts

### Frontend JavaScript

#### Reading Response Headers

```javascript
const response = await fetch('/api/users')

// Read specific headers
const contentType = response.headers.get('Content-Type')
const totalCount = response.headers.get('X-Total-Count')
const rateLimit = response.headers.get('X-RateLimit-Remaining')

console.log('Content type:', contentType)
console.log('Total users:', totalCount)
console.log('Requests remaining:', rateLimit)

// Iterate all headers
for (const [name, value] of response.headers) {
  console.log(`${name}: ${value}`)
}

// Check if header exists
if (response.headers.has('X-Custom-Header')) {
  console.log('Custom header found')
}
```

#### Setting Request Headers

```javascript
// Method 1: Headers object
const headers = new Headers()
headers.append('Authorization', 'Bearer token123')
headers.append('X-API-Key', 'my-key')

fetch('/api/data', { headers })

// Method 2: Plain object
fetch('/api/data', {
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  }
})

// Method 3: Headers constructor
const headers = new Headers({
  'Authorization': 'Bearer token123',
  'Content-Type': 'application/json'
})

fetch('/api/data', { headers })
```

#### Headers with Different Request Types

```javascript
// GET with headers
const getUsers = () => fetch('/api/users', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
})

// POST with JSON
const createUser = (userData) => fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(userData)
})

// File upload (don't set Content-Type - browser does it)
const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
      // No Content-Type - browser sets multipart/form-data automatically
    },
    body: formData
  })
}

// Custom headers for API
const apiCall = () => fetch('/api/data', {
  headers: {
    'X-API-Key': 'your-key',
    'X-Client-Version': '1.0.0',
    'X-Request-ID': generateUUID()
  }
})
```

### Backend Express.js

#### Reading Request Headers

```javascript
app.get('/api/users', (req, res) => {
  // Get specific headers
  const userAgent = req.get('User-Agent')
  const auth = req.get('Authorization')
  const apiKey = req.get('X-API-Key')
  
  // Or use req.headers object
  const contentType = req.headers['content-type']
  const host = req.headers.host
  
  // Check if header exists
  if (req.get('X-Custom-Header')) {
    console.log('Custom header present')
  }
  
  // Get all headers
  console.log('All headers:', req.headers)
  
  res.json({ message: 'Headers received' })
})
```

#### Setting Response Headers

```javascript
app.get('/api/users', (req, res) => {
  // Method 1: res.set()
  res.set('X-Total-Count', '100')
  res.set('X-API-Version', '2.1')
  
  // Method 2: res.header() (alias for res.set)
  res.header('Cache-Control', 'no-cache')
  
  // Method 3: Set multiple at once
  res.set({
    'X-Custom-Header': 'value',
    'X-Another-Header': 'another-value'
  })
  
  // Method 4: Chain them
  res
    .set('X-Header-1', 'value1')
    .set('X-Header-2', 'value2')
    .json({ users: [] })
})
```

#### Header Middleware

```javascript
// Add headers to all responses
app.use((req, res, next) => {
  res.set({
    'X-Powered-By': 'My-App',
    'X-API-Version': '2.1',
    'X-Response-Time': Date.now()
  })
  next()
})

// Security headers middleware
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  })
  next()
})

// CORS headers
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': req.get('Origin'),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  next()
})
```

#### Conditional Headers

```javascript
app.get('/api/data', (req, res) => {
  const userAgent = req.get('User-Agent')
  
  // Different headers for different clients
  if (userAgent.includes('Mobile')) {
    res.set('X-Mobile-Optimized', 'true')
  }
  
  // Different caching for authenticated users
  if (req.get('Authorization')) {
    res.set('Cache-Control', 'private, no-cache')
  } else {
    res.set('Cache-Control', 'public, max-age=3600')
  }
  
  res.json({ data: 'response' })
})
```

## Advanced Header Concepts

### Header Case Sensitivity

```javascript
// HTTP headers are case-insensitive
// These are all the same:
req.get('Content-Type')
req.get('content-type')
req.get('CONTENT-TYPE')

// But Node.js normalizes them to lowercase
console.log(req.headers['content-type'])  // Works
console.log(req.headers['Content-Type'])  // undefined
```

### Header Size Limits

```javascript
// Headers have size limits (usually 8KB total)
// Don't put large data in headers

// ❌ Bad - too large
res.set('X-Large-Data', JSON.stringify(largeObject))

// ✅ Good - use response body
res.json({ 
  metadata: { timestamp: Date.now() },
  data: largeObject 
})
```

### Multi-Value Headers

```javascript
// Some headers can have multiple values
app.use((req, res, next) => {
  // Set-Cookie can be set multiple times
  res.cookie('sessionId', 'abc123')
  res.cookie('theme', 'dark')
  res.cookie('language', 'en')
  
  // Results in multiple Set-Cookie headers:
  // Set-Cookie: sessionId=abc123; Path=/
  // Set-Cookie: theme=dark; Path=/
  // Set-Cookie: language=en; Path=/
  
  next()
})
```

### Header Overriding

```javascript
// Later headers override earlier ones (except multi-value headers)
app.use((req, res, next) => {
  res.set('X-Custom', 'first-value')
  res.set('X-Custom', 'second-value')  // Overwrites first
  // Final header: X-Custom: second-value
  next()
})
```

## Real-World Header Examples

### API Rate Limiting

```javascript
const rateLimit = new Map()

app.use((req, res, next) => {
  const clientId = req.ip
  const now = Date.now()
  const windowMs = 60 * 1000  // 1 minute
  const maxRequests = 100
  
  // Get client's request history
  const requests = rateLimit.get(clientId) || []
  const recentRequests = requests.filter(time => now - time < windowMs)
  
  // Add current request
  recentRequests.push(now)
  rateLimit.set(clientId, recentRequests)
  
  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - recentRequests.length).toString(),
    'X-RateLimit-Reset': (Math.floor(now / windowMs) * windowMs + windowMs).toString()
  })
  
  if (recentRequests.length > maxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }
  
  next()
})
```

### API Versioning

```javascript
app.use('/api', (req, res, next) => {
  // Version from header
  const version = req.get('X-API-Version') || '1.0'
  
  // Add version info to response
  res.set('X-API-Version', version)
  
  // Route to different handlers based on version
  if (version.startsWith('2.')) {
    req.apiVersion = '2.0'
  } else {
    req.apiVersion = '1.0'
  }
  
  next()
})

app.get('/api/users', (req, res) => {
  if (req.apiVersion === '2.0') {
    // New format
    res.json({
      data: users,
      meta: { total: users.length, version: '2.0' }
    })
  } else {
    // Legacy format
    res.json(users)
  }
})
```

### Content Negotiation

```javascript
app.get('/api/users', (req, res) => {
  const accept = req.get('Accept') || 'application/json'
  
  if (accept.includes('application/json')) {
    res.json(users)
  } else if (accept.includes('text/csv')) {
    const csv = users.map(u => `${u.id},${u.name},${u.email}`).join('\n')
    res.set('Content-Type', 'text/csv')
    res.send(`id,name,email\n${csv}`)
  } else if (accept.includes('application/xml')) {
    const xml = `<?xml version="1.0"?>
      <users>
        ${users.map(u => `<user><id>${u.id}</id><name>${u.name}</name></user>`).join('')}
      </users>`
    res.set('Content-Type', 'application/xml')
    res.send(xml)
  } else {
    res.status(406).json({ error: 'Not Acceptable' })
  }
})
```

### Request Tracking

```javascript
// Generate unique request ID
app.use((req, res, next) => {
  const requestId = req.get('X-Request-ID') || generateUUID()
  
  // Add to request for logging
  req.requestId = requestId
  
  // Return in response for client tracking
  res.set('X-Request-ID', requestId)
  
  // Log request with ID
  console.log(`[${requestId}] ${req.method} ${req.path}`)
  
  next()
})

// Use in error handling
app.use((err, req, res, next) => {
  console.error(`[${req.requestId}] Error:`, err.message)
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.requestId 
  })
})
```

### Security Headers Bundle

```javascript
const securityHeaders = (req, res, next) => {
  res.set({
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Force HTTPS (only if using HTTPS)
    ...(req.secure && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }),
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:"
    ].join('; '),
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Feature policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  })
  
  next()
}

app.use(securityHeaders)
```

## Debugging Headers

### Browser Developer Tools

```javascript
// In browser console, inspect request/response headers:

// Method 1: Network tab
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Make request
// 4. Click on request to see headers

// Method 2: Console logging
fetch('/api/users')
  .then(response => {
    console.log('Response headers:')
    for (const [name, value] of response.headers) {
      console.log(`${name}: ${value}`)
    }
    return response.json()
  })
```

### Server-Side Debugging

```javascript
// Log all incoming headers
app.use((req, res, next) => {
  console.log('Incoming headers:', req.headers)
  next()
})

// Log specific headers
app.use((req, res, next) => {
  console.log('User-Agent:', req.get('User-Agent'))
  console.log('Authorization:', req.get('Authorization'))
  console.log('Content-Type:', req.get('Content-Type'))
  next()
})

// Log outgoing headers
app.use((req, res, next) => {
  const originalSend = res.send
  res.send = function(data) {
    console.log('Outgoing headers:', res.getHeaders())
    originalSend.call(this, data)
  }
  next()
})
```

### curl for Header Testing

```bash
# View response headers
curl -I http://localhost:3000/api/users

# Send custom headers
curl -H "Authorization: Bearer token123" \
     -H "X-API-Key: my-key" \
     http://localhost:3000/api/users

# View both request and response headers
curl -v http://localhost:3000/api/users

# Send JSON with headers
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer token123" \
     -d '{"name":"John"}' \
     http://localhost:3000/api/users
```

## Common Header Mistakes and Solutions

### Mistake 1: Setting Headers After Response Sent

```javascript
// ❌ Error - headers already sent
app.get('/api/users', (req, res) => {
  res.json({ users: [] })
  res.set('X-Custom', 'value')  // Error: Cannot set headers after they are sent
})

// ✅ Correct - set headers before sending response
app.get('/api/users', (req, res) => {
  res.set('X-Custom', 'value')
  res.json({ users: [] })
})
```

### Mistake 2: Case Sensitivity Confusion

```javascript
// ❌ Wrong - checking wrong case
if (req.headers['Content-Type']) {  // undefined
  // This won't work
}

// ✅ Correct - use lowercase or req.get()
if (req.headers['content-type']) {  // Works
  // Or better:
}
if (req.get('Content-Type')) {      // Best - case insensitive
  // This works
}
```

### Mistake 3: Missing Content-Type

```javascript
// ❌ Browser might guess content type wrong
res.send('{"name": "John"}')

// ✅ Always specify content type
res.set('Content-Type', 'application/json')
res.send('{"name": "John"}')

// ✅ Or use convenience methods
res.json({ name: 'John' })  // Sets Content-Type automatically
```

### Mistake 4: Forgetting CORS Headers

```javascript
// ❌ Frontend can't read custom headers
res.set('X-Total-Count', '100')
res.json(users)

// ✅ Expose custom headers for CORS
res.set('Access-Control-Expose-Headers', 'X-Total-Count')
res.set('X-Total-Count', '100')
res.json(users)
```

## Summary: Key Header Concepts

### Essential Request Headers
- **Host**: Which website you're accessing
- **User-Agent**: What browser/app you're using
- **Accept**: What response formats you understand
- **Authorization**: Your credentials
- **Content-Type**: Type of data you're sending (POST/PUT)

### Essential Response Headers
- **Content-Type**: Type of data server is sending
- **Content-Length**: Size of response body
- **Set-Cookie**: Store data in browser
- **Cache-Control**: How to cache the response
- **Location**: Where to find created/moved resource

### Security Headers
- **X-Content-Type-Options**: Prevent MIME sniffing
- **X-Frame-Options**: Prevent clickjacking
- **Content-Security-Policy**: Control resource loading
- **Strict-Transport-Security**: Force HTTPS

### Best Practices
1. Always set Content-Type for responses
2. Use security headers in production
3. Expose custom headers for CORS if needed
4. Set headers before sending response body
5. Use lowercase when accessing req.headers directly
6. Don't put large data in headers
7. Validate and sanitize header values

### Headers vs Other Mechanisms
- **Headers**: Metadata about request/response
- **Query params**: Filter/search parameters in URL
- **Request body**: Main data being sent
- **Cookies**: Persistent client-side storage
- **Local Storage**: Client-side data (not sent with requests)

Remember: Headers are like the envelope on a letter - they contain the delivery instructions and metadata, while the body contains the actual message! 📮✉️