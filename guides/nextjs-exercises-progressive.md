# Next.js Progressive Exercises - From Simple to Advanced

## Overview: Your Learning Journey

These exercises are designed to build your Next.js skills progressively. Each exercise builds on the previous ones, introducing new concepts while reinforcing what you've learned.

**Prerequisites:** Basic knowledge of React, HTML, CSS, and JavaScript

**What you'll build:** A complete blog platform with authentication, analytics, and advanced features

## Exercise 1: Basic Next.js Setup (30 minutes)

**Goal:** Create your first Next.js app and understand the basics

### What You'll Learn

- Next.js project structure
- File-based routing
- Basic pages and navigation
- Static assets

### Tasks

1. **Create a new Next.js project**

```bash
npx create-next-app@latest my-blog --typescript --tailwind --eslint --app
cd my-blog
npm run dev
```

2. **Create basic pages**

```
app/
├── page.js                 # Home page
├── about/
│   └── page.js            # About page
├── contact/
│   └── page.js            # Contact page
└── layout.js              # Root layout
```

3. **Home page (app/page.js)**

```jsx
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to My Blog</h1>
      <p className="text-lg text-gray-600">
        This is a simple blog built with Next.js
      </p>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h3 className="text-xl font-medium">My First Blog Post</h3>
            <p className="text-gray-600">
              This is a preview of my first post...
            </p>
          </div>
          <div className="border p-4 rounded">
            <h3 className="text-xl font-medium">Learning Next.js</h3>
            <p className="text-gray-600">
              Here's what I learned about Next.js...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

4. **Add navigation to layout (app/layout.js)**

```jsx
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "My Blog",
  description: "A simple blog built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              My Blog
            </Link>
            <div className="space-x-4">
              <Link href="/" className="hover:text-blue-200">
                Home
              </Link>
              <Link href="/about" className="hover:text-blue-200">
                About
              </Link>
              <Link href="/contact" className="hover:text-blue-200">
                Contact
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**Success Criteria:**

- ✅ App runs on localhost:3000
- ✅ Navigation works between pages
- ✅ Pages display correctly
- ✅ Styling looks good

---

## Exercise 2: Dynamic Routes and Data Fetching (45 minutes)

**Goal:** Add dynamic blog posts with individual post pages

### What You'll Learn

- Dynamic routes `[id]`
- Data fetching in Server Components
- `notFound()` function
- Basic SEO with metadata

### Tasks

1. **Create blog post data**

```javascript
// lib/posts.js
const posts = [
  {
    id: "1",
    title: "Getting Started with Next.js",
    content:
      "Next.js is a powerful React framework that makes building web applications easy...",
    excerpt:
      "Learn the basics of Next.js and why it's great for React developers",
    author: "John Doe",
    publishedAt: "2024-01-15",
    tags: ["nextjs", "react", "javascript"],
  },
  {
    id: "2",
    title: "Understanding Server Components",
    content: "Server Components are a new way to build React applications...",
    excerpt:
      "Deep dive into React Server Components and how they work in Next.js",
    author: "Jane Smith",
    publishedAt: "2024-01-20",
    tags: ["react", "server-components", "nextjs"],
  },
  {
    id: "3",
    title: "Building APIs with Next.js",
    content: "Next.js makes it easy to build full-stack applications...",
    excerpt: "Learn how to create API routes and handle data in Next.js",
    author: "Bob Johnson",
    publishedAt: "2024-01-25",
    tags: ["nextjs", "api", "backend"],
  },
];

export function getAllPosts() {
  return posts;
}

export function getPost(id) {
  return posts.find((post) => post.id === id);
}

export function getPostsByTag(tag) {
  return posts.filter((post) => post.tags.includes(tag));
}
```

2. **Create blog listing page**

```jsx
// app/blog/page.js
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog - My Blog",
  description: "Read our latest blog posts about web development",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/blog/${post.id}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>By {post.author}</span>
              <span>{post.publishedAt}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

3. **Create dynamic post page**

```jsx
// app/blog/[id]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getAllPosts } from "@/lib/posts";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({ params }) {
  const post = getPost(params.id);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} - My Blog`,
    description: post.excerpt,
    keywords: post.tags.join(", "),
  };
}

export default function BlogPost({ params }) {
  const post = getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/blog"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.publishedAt}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed">{post.content}</p>
        </div>
      </article>
    </div>
  );
}
```

4. **Add blog link to navigation**

```jsx
// Update app/layout.js navigation
<div className="space-x-4">
  <Link href="/" className="hover:text-blue-200">
    Home
  </Link>
  <Link href="/blog" className="hover:text-blue-200">
    Blog
  </Link>
  <Link href="/about" className="hover:text-blue-200">
    About
  </Link>
  <Link href="/contact" className="hover:text-blue-200">
    Contact
  </Link>
</div>
```

**Success Criteria:**

- ✅ Blog listing page shows all posts
- ✅ Individual post pages work with URLs like `/blog/1`
- ✅ 404 page shows for non-existent posts
- ✅ Metadata is set correctly for SEO

---

## Exercise 3: API Routes and Form Handling (60 minutes)

**Goal:** Add contact form with API route and basic form handling

### What You'll Learn

- API routes in App Router
- Form handling with Server Actions
- Data validation
- Response handling

### Tasks

1. **Create API route for contact form**

```javascript
// app/api/contact/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // In a real app, you'd save this to a database
    console.log("Contact form submission:", { name, email, message });

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json(
      { message: "Thank you for your message! We'll get back to you soon." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Contact API is working" },
    { status: 200 },
  );
}
```

2. **Create contact form with client-side handling**

```jsx
// app/contact/page.js
"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus(`error: ${data.error}`);
      }
    } catch (error) {
      setStatus("error: Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>

        {status && (
          <div
            className={`p-4 rounded-md ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status === "success"
              ? "Thank you for your message! We'll get back to you soon."
              : status.replace("error: ", "")}
          </div>
        )}
      </form>
    </div>
  );
}
```

3. **Alternative: Server Actions approach**

```jsx
// app/contact-server/page.js
import { redirect } from "next/navigation";

async function submitContact(formData) {
  "use server";

  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // Validation
  if (!name || !email || !message) {
    throw new Error("All fields are required");
  }

  // Process the form (save to database, send email, etc.)
  console.log("Server Action submission:", { name, email, message });

  // Redirect to success page
  redirect("/contact-server?success=true");
}

export default function ContactServerPage({ searchParams }) {
  const success = searchParams.success;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Contact Us (Server Actions)</h1>

      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
          Thank you for your message! We'll get back to you soon.
        </div>
      )}

      <form action={submitContact} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
```

**Success Criteria:**

- ✅ Contact form submits data to API route
- ✅ Form validation works (client and server)
- ✅ Success/error messages display
- ✅ Form resets after successful submission

---

## Exercise 4: Middleware and Authentication (90 minutes)

**Goal:** Add authentication with middleware protection

### What You'll Learn

- Next.js middleware
- JWT tokens and cookies
- Protected routes
- Authentication state

### Tasks

1. **Create auth utilities**

```javascript
// lib/auth.js
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key",
);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Simple user "database"
const users = [
  { id: "1", email: "admin@example.com", password: "password", role: "admin" },
  { id: "2", email: "user@example.com", password: "password", role: "user" },
];

export function findUser(email, password) {
  return users.find(
    (user) => user.email === email && user.password === password,
  );
}

export function getUserById(id) {
  return users.find((user) => user.id === id);
}
```

2. **Create middleware**

```javascript
// middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define protected paths
  const protectedPaths = ["/dashboard", "/admin"];
  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath),
  );

  if (isProtectedPath) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      console.log("Invalid token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add user info to headers for pages to use
    const response = NextResponse.next();
    response.headers.set("X-User-ID", payload.userId);
    response.headers.set("X-User-Role", payload.role);
    return response;
  }

  // Redirect logged-in users away from auth pages
  if (path === "/login" || path === "/register") {
    const token = request.cookies.get("token")?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
```

3. **Create login API and page**

```javascript
// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { signToken, findUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = findUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: { id: user.id, email: user.email, role: user.role },
      },
      { status: 200 },
    );

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
```

```jsx
// app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Test accounts: admin@example.com / user@example.com (password:
              password)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
```

4. **Create protected dashboard**

```jsx
// app/dashboard/page.js
import { headers } from "next/headers";
import { getUserById } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const headersList = headers();
  const userId = headersList.get("X-User-ID");
  const userRole = headersList.get("X-User-Role");

  const user = getUserById(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
        <p className="text-gray-600">Email: {user?.email}</p>
        <p className="text-gray-600">Role: {userRole}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Posts</h3>
          <p className="text-2xl font-bold text-blue-900">12</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Views</h3>
          <p className="text-2xl font-bold text-green-900">1,234</p>
        </div>
        <div className="bg-purple-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Comments</h3>
          <p className="text-2xl font-bold text-purple-900">56</p>
        </div>
      </div>

      {userRole === "admin" && (
        <div className="mt-8 bg-yellow-100 border border-yellow-400 p-4 rounded">
          <h3 className="font-semibold text-yellow-800">Admin Panel</h3>
          <p className="text-yellow-700">You have admin access!</p>
        </div>
      )}
    </div>
  );
}
```

```jsx
// app/dashboard/LogoutButton.js
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  );
}
```

5. **Create logout API**

```javascript
// app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
  });

  return response;
}
```

**Success Criteria:**

- ✅ Middleware protects `/dashboard` routes
- ✅ Login form authenticates users
- ✅ JWT tokens stored in HTTP-only cookies
- ✅ Dashboard shows user info
- ✅ Logout clears authentication

---

## Exercise 5: Advanced Routing Features (120 minutes)

**Goal:** Implement parallel routes, route intercepting, and suspense

### What You'll Learn

- Parallel routes with `@slot` folders
- Route intercepting with `(.)`
- Suspense boundaries
- Complex layouts

### Tasks

1. **Create advanced dashboard with parallel routes**

```
app/
├── dashboard/
│   ├── layout.js              # Dashboard layout with parallel slots
│   ├── page.js                # Main dashboard content
│   ├── @analytics/            # Analytics parallel route
│   │   ├── page.js
│   │   ├── loading.js
│   │   └── error.js
│   ├── @notifications/        # Notifications parallel route
│   │   ├── page.js
│   │   └── loading.js
│   ├── @activity/             # Activity feed parallel route
│   │   ├── page.js
│   │   └── loading.js
│   └── posts/
│       ├── page.js            # Posts list
│       ├── [id]/
│       │   └── page.js        # Post detail
│       └── (.)[id]/           # Intercepted modal
│           └── page.js
```

2. **Dashboard layout with parallel routes**

```jsx
// app/dashboard/layout.js
import { Suspense } from "react";

export default function DashboardLayout({
  children,
  analytics,
  notifications,
  activity,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex space-x-4">
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                Overview
              </a>
              <a
                href="/dashboard/posts"
                className="text-gray-600 hover:text-gray-800"
              >
                Posts
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Main content area */}
        <div className="mb-8">{children}</div>

        {/* Parallel routes grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Analytics section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Analytics</h2>
              <Suspense fallback={<AnalyticsLoading />}>{analytics}</Suspense>
            </div>
          </div>

          {/* Sidebar with notifications and activity */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-md font-semibold mb-4">Notifications</h3>
              <Suspense fallback={<NotificationsLoading />}>
                {notifications}
              </Suspense>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-md font-semibold mb-4">Recent Activity</h3>
              <Suspense fallback={<ActivityLoading />}>{activity}</Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

function NotificationsLoading() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  );
}

function ActivityLoading() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  );
}
```

3. **Analytics parallel route**

```jsx
// app/dashboard/@analytics/page.js
import { Suspense } from "react";

async function getAnalyticsData() {
  // Simulate slow API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    pageViews: 12543,
    uniqueVisitors: 8942,
    bounceRate: 23.5,
    avgSessionDuration: "2m 34s",
    chartData: [
      { day: "Mon", views: 1200 },
      { day: "Tue", views: 1900 },
      { day: "Wed", views: 1600 },
      { day: "Thu", views: 2100 },
      { day: "Fri", views: 1800 },
      { day: "Sat", views: 1400 },
      { day: "Sun", views: 1100 },
    ],
  };
}

export default async function AnalyticsSlot() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {data.pageViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Page Views</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {data.uniqueVisitors.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Unique Visitors</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {data.bounceRate}%
          </p>
          <p className="text-sm text-gray-600">Bounce Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {data.avgSessionDuration}
          </p>
          <p className="text-sm text-gray-600">Avg Session</p>
        </div>
      </div>

      {/* Simple chart */}
      <div className="space-y-2">
        <h4 className="font-medium">Weekly Views</h4>
        <div className="flex items-end space-x-2 h-32">
          {data.chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(item.views / 2500) * 100}%` }}
              ></div>
              <p className="text-xs mt-1">{item.day}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

4. **Notifications and Activity parallel routes**

```jsx
// app/dashboard/@notifications/page.js
async function getNotifications() {
  await new Promise(resolve => setTimeout(resolve, 1500))

  return [
    { id: 1, message: 'New comment on "Getting Started"', time: '2m ago', unread: true },
    { id: 2, message: 'Post "Advanced Next.js" published', time: '1h ago', unread: true },
    { id: 3, message: 'User registration: john@example.com', time: '3h ago', unread: false },
    { id: 4, message: 'Weekly report generated', time: '1d ago', unread: false }
  ]
}

export default async function NotificationsSlot() {
  const notifications = await getNotifications()

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-3 rounded text-sm ${
            notification.unread
              ? 'bg-blue-50 border-l-4 border-blue-400'
              : 'bg-gray-50'
          }`}
        >
          <p className={notification.unread ? 'font-medium' : ''}>{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
        </div>
      ))}
    </div>
  )
}

// app/dashboard/@activity/page.js
async function getActivity() {
  await new Promise(resolve => setTimeout(resolve, 1000))

  return [
    { id: 1, action: 'Updated post "React Patterns"', time: '10m ago' },
    { id: 2, action: 'Logged in to dashboard', time: '2h ago' },
    { id: 3, action: 'Created new post "Next.js Guide"', time: '1d ago' },
    { id: 4, action: 'Changed profile settings', time: '2d ago' },
    { id: 5, action: 'Uploaded new image', time: '3d ago' }
  ]
}

export default async function ActivitySlot() {
  const activities = await getActivity()

  return (
    <div className="space-y-2">
      {activities.map(activity => (
        <div key={activity.id} className="text-sm">
          <p className="text-gray-800">{activity.action}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      ))}
    </div>
  )
}
```

5. **Posts with route intercepting (modal)**

```jsx
// app/dashboard/posts/page.js
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default function PostsPage() {
  const posts = getAllPosts()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Posts</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/dashboard/posts/${post.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
          >
            <h3 className="font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{post.author}</span>
              <span>{post.publishedAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// app/dashboard/posts/(.)[id]/page.js - Intercepted modal
import { getPost } from '@/lib/posts'
import Modal from '@/components/Modal'

export default function PostModal({ params }) {
  const post = getPost(params.id)

  if (!post) {
    return (
      <Modal>
        <div className="p-6">
          <h2 className="text-xl font-bold">Post not found</h2>
        </div>
      </Modal>
    )
  }

  return (
    <Modal>
      <div className="p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.publishedAt}</span>
        </div>
        <div className="prose">
          <p>{post.content}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Modal>
  )
}

// app/dashboard/posts/[id]/page.js - Full page
import Link from 'next/link'
import { getPost } from '@/lib/posts'
import { notFound } from 'next/navigation'

export default function PostDetailPage({ params }) {
  const post = getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/posts"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Posts
      </Link>

      <article className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-8">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.publishedAt}</span>
        </div>
        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed">{post.content}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  )
}
```

6. **Modal component**

```jsx
// components/Modal.js
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Modal({ children }) {
  const router = useRouter();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        router.back();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [router]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={() => router.back()}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
```

**Success Criteria:**

- ✅ Dashboard shows three parallel sections loading independently
- ✅ Analytics, notifications, and activity load at different speeds
- ✅ Clicking posts opens modal overlay (intercepted route)
- ✅ Direct navigation to post URLs shows full page
- ✅ Modal closes with Escape key or background click

---

## Exercise 6: Final Project - Complete Blog Platform (180 minutes)

**Goal:** Combine everything into a production-ready blog platform

### What You'll Build

- Complete blog with admin panel
- User management
- Search functionality
- Comments system
- Advanced caching

### Tasks

1. **Enhanced folder structure**

```
app/
├── (public)/              # Public routes
│   ├── layout.js
│   ├── page.js            # Home
│   ├── blog/
│   │   ├── page.js        # Blog listing
│   │   ├── [slug]/
│   │   │   └── page.js    # Blog post
│   │   └── tag/
│   │       └── [tag]/
│   │           └── page.js # Posts by tag
│   ├── about/
│   │   └── page.js
│   └── contact/
│       └── page.js
├── (auth)/                # Auth routes
│   ├── layout.js
│   ├── login/
│   │   └── page.js
│   └── register/
│       └── page.js
├── (dashboard)/           # Protected dashboard
│   ├── layout.js
│   ├── dashboard/
│   │   ├── page.js
│   │   ├── @analytics/
│   │   ├── @notifications/
│   │   └── @activity/
│   ├── posts/
│   │   ├── page.js
│   │   ├── new/
│   │   │   └── page.js
│   │   ├── [id]/
│   │   │   └── page.js
│   │   └── (.)[id]/
│   │       └── page.js
│   └── users/
│       ├── page.js
│       └── [id]/
│           └── page.js
├── api/
│   ├── auth/
│   ├── posts/
│   ├── comments/
│   └── search/
└── globals.css
```

This exercise structure provides a comprehensive learning path from basic Next.js concepts to advanced features. Each exercise builds upon the previous one, ensuring you understand the fundamentals before moving to complex patterns.

**Final Success Criteria:**

- ✅ Complete authentication system
- ✅ Protected routes with middleware
- ✅ Parallel routes and intercepting
- ✅ Server actions and API routes
- ✅ Dynamic routing and metadata
- ✅ Production-ready blog platform

**Next Steps:**

- Deploy to Vercel
- Add database (PostgreSQL/MongoDB)
- Implement search with Algolia
- Add email notifications
- Performance optimization
- Testing with Jest/Playwright

This progression takes you from Next.js beginner to advanced developer, covering all the concepts from your guides in practical, hands-on exercises!

