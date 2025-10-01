# Docker Complete Guide - Explained Like You're 5

## The Big Picture: What is Docker?

Imagine you're a chef who travels the world cooking in different kitchens.  
Every kitchen is different:

- Different stoves, ovens, ingredients
- Different operating systems (gas vs electric)
- Different versions of tools

**Without Docker:** You'd have to learn each kitchen, install your tools  
everywhere, and your recipes might not work the same way.

**With Docker:** You bring your own portable kitchen (container) that works  
exactly the same everywhere! Your "kitchen box" contains:

- Your recipe (application code)
- All your ingredients (dependencies)
- Your tools (runtime environment)
- Instructions for setup (Dockerfile)

## Understanding the Docker Ecosystem

### Images vs Containers - The Blueprint vs The House

**Docker Image** = Blueprint for a house

- Instructions for building something
- Doesn't change once created
- Can be shared with others
- Used to create containers

**Docker Container** = Actual house built from blueprint

- A running instance of an image
- Has its own space and resources
- Can be started, stopped, destroyed
- Changes during runtime

```bash
# Think of it like this:
docker build -t my-app .          # Create blueprint (image)
docker run my-app                 # Build house from blueprint (container)
docker run my-app                 # Build another house (another container)
```

### The Dockerfile - Your Recipe Card

A Dockerfile is like a recipe card that tells Docker how to build your image:

```dockerfile
# Start with a base kitchen (operating system + tools)
FROM node:18-alpine

# Set up your workspace in the kitchen
WORKDIR /app

# Bring in your ingredient list
COPY package.json package-lock.json ./

# Go shopping for ingredients (install dependencies)
RUN npm ci --only=production

# Bring in your recipe (source code)
COPY . .

# Set the default temperature (environment)
ENV NODE_ENV=production

# Tell others what oven temperature to use (port)
EXPOSE 3000

# Instructions for cooking (start command)
CMD ["npm", "start"]
```

## Creating Dockerfiles - Step by Step

### Example 1: Simple Node.js App

```dockerfile
# Step 1: Choose your base kitchen
# alpine = smaller, lighter version
FROM node:18-alpine

# Step 2: Create a working directory
# Like setting up your workspace in the kitchen
WORKDIR /app

# Step 3: Copy dependency files first
# This is an optimization - Docker can cache this layer
COPY package*.json ./

# Step 4: Install dependencies
# RUN executes commands during build time
RUN npm ci --only=production && npm cache clean --force

# Step 5: Copy your source code
# Do this AFTER installing deps for better caching
COPY . .

# Step 6: Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Step 7: Tell Docker what port your app uses
# This is documentation - doesn't actually publish the port
EXPOSE 3000

# Step 8: Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Step 9: Define the startup command
CMD ["npm", "start"]
```

### Example 2: Python Flask App

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

EXPOSE 5000

CMD ["python", "app.py"]
```

### Example 3: Multi-Stage Build (Advanced)

Sometimes you need different tools for building vs running:

```dockerfile
# Stage 1: Build stage (the construction site)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production stage (the finished house)
FROM node:18-alpine AS production

WORKDIR /app

# Only copy what we need for production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
```

**Why multi-stage?**

- Builder stage has all build tools (heavy)
- Production stage only has runtime files (light)
- Final image is much smaller

## Understanding Docker Networking

### The Apartment Building Analogy

Imagine Docker containers are apartments in a building:

**Default Network (bridge):**

- Each apartment has its own internal phone system
- Apartments can call each other using apartment numbers
- Outside world can only reach apartments through the front desk (port mapping)

**Custom Networks:**

- Like creating private phone networks for specific groups
- Database apartments can talk to app apartments privately
- More secure and organized

### Basic Networking Commands

```bash
# List all networks
docker network ls

# Create a custom network (like creating a private phone line)
docker network create my-app-network

# Run container on specific network
docker run --network my-app-network --name web-app my-app

# Run another container on same network
docker run --network my-app-network --name database postgres:13
```

### Container Communication Examples

```bash
# Example: App + Database on same network
docker network create app-network

# Start database (apartment 1)
docker run -d \
  --name postgres-db \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:13

# Start app (apartment 2)
docker run -d \
  --name web-app \
  --network app-network \
  -p 3000:3000 \
  my-app

# Inside web-app, you can connect to database using:
# Host: postgres-db (the container name!)
# Port: 5432 (internal port, no mapping needed)
```

**Key Insight:** Containers on the same network can talk to each other using  
container names as hostnames!

### Port Mapping - The Front Desk

```bash
# Map container port to host port
docker run -p 8080:3000 my-app
#         ↑         ↑
#    host port  container port

# Multiple port mappings
docker run -p 8080:3000 -p 8443:443 my-app

# Bind to specific interface
docker run -p 127.0.0.1:8080:3000 my-app
```

**Without port mapping:** Container is isolated, can't be reached from outside
**With port mapping:** Outside world can reach container through specific ports

## Volumes - Persistent Storage

### The Storage Problem

Containers are like hotel rooms - when you check out, everything gets cleaned up:

```bash
docker run postgres:13           # Create database
# Add some data...
docker stop <container-id>       # Stop container
docker run postgres:13           # Start new container
# All data is gone! 😱
```

### Types of Storage

#### 1. Named Volumes (Recommended)

Like having a safety deposit box at the bank:

```bash
# Create a named volume
docker volume create my-database-data

# Use the volume
docker run -d \
  --name postgres \
  -v my-database-data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:13

# Data persists even if container is deleted!
docker rm postgres
docker run -d --name postgres-new -v my-database-data:/var/lib/postgresql/data postgres:13
# Your data is still there! 🎉
```

#### 2. Bind Mounts (Development)

Like connecting your home folder to the container:

```bash
# Mount your local code into container
docker run -d \
  --name dev-app \
  -v /Users/you/my-app:/app \
  -p 3000:3000 \
  node:18-alpine \
  sh -c "cd /app && npm start"

# Changes to local files immediately appear in container!
```

**Perfect for development:** Edit code locally, see changes instantly in container.

#### 3. Anonymous Volumes

Temporary storage that Docker manages:

```bash
docker run -v /app/data my-app
# Docker creates a volume automatically, but you can't easily find it
```

### Volume Examples

#### Development Setup with Live Reload

```bash
# Project structure:
# my-app/
#   ├── package.json
#   ├── src/
#   └── Dockerfile

# Run development container with live reload
docker run -d \
  --name dev-server \
  -v "$(pwd):/app" \
  -v /app/node_modules \
  -p 3000:3000 \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev"
```

**What's happening:**

- `-v "$(pwd):/app"` - Mount current directory to /app
- `-v /app/node_modules` - Protect node_modules from being overwritten
- Changes to your local files trigger hot reload in container

#### Database with Persistent Data

```bash
# Create volume for database
docker volume create postgres-data

# Run database with persistent storage
docker run -d \
  --name my-database \
  -v postgres-data:/var/lib/postgresql/data \
  -e POSTGRES_DB=myapp \
  -e POSTGRES_USER=developer \
  -e POSTGRES_PASSWORD=secret123 \
  -p 5432:5432 \
  postgres:13

# Connect from outside container
psql -h localhost -p 5432 -U developer -d myapp
```

## Setting Up Development Databases

### PostgreSQL Database Container

```bash
# Create network for database
docker network create db-network

# Create volume for data persistence
docker volume create postgres-data

# Run PostgreSQL container
docker run -d \
  --name postgres-dev \
  --network db-network \
  -v postgres-data:/var/lib/postgresql/data \
  -e POSTGRES_DB=myapp_development \
  -e POSTGRES_USER=developer \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:13

# Wait a moment for startup, then connect
sleep 5
docker exec -it postgres-dev psql -U developer -d myapp_development
```

**Create some sample data:**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

SELECT * FROM users;
```

### MySQL Database Container

```bash
# Create volume for MySQL data
docker volume create mysql-data

# Run MySQL container
docker run -d \
  --name mysql-dev \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=myapp_development \
  -e MYSQL_USER=developer \
  -e MYSQL_PASSWORD=dev_password \
  -p 3306:3306 \
  mysql:8.0

# Connect to MySQL
docker exec -it mysql-dev mysql -u developer -p myapp_development
```

### Redis Cache Container

```bash
# Create volume for Redis data
docker volume create redis-data

# Run Redis container
docker run -d \
  --name redis-dev \
  -v redis-data:/data \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes

# Connect to Redis
docker exec -it redis-dev redis-cli
```

## Docker Compose - Managing Multiple Containers

When you have multiple containers (app + database + cache), managing them  
individually becomes tedious. Docker Compose is like a smart home system that  
controls all your devices with one command.

### Basic docker-compose.yml

```yaml
# docker-compose.yml
version: "3.8"

services:
  # Web application
  app:
    build: . # Build from Dockerfile in current directory
    ports:
      - "3000:3000" # Map port 3000 to host
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://developer:dev_password@postgres:5432/myapp_development
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app # Mount current directory for development
      - /app/node_modules # Protect node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  # PostgreSQL Database
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp_development
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432" # Expose to host for external access
    networks:
      - app-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379" # Expose to host for external access
    networks:
      - app-network

  # Database admin tool (optional)
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    depends_on:
      - postgres
    networks:
      - app-network

# Define networks
networks:
  app-network:
    driver: bridge

# Define volumes
volumes:
  postgres-data:
  redis-data:
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in background (detached)
docker-compose up -d

# Build and start (if Dockerfile changed)
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (BE CAREFUL!)
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs app          # Logs for specific service

# Run commands in service
docker-compose exec app bash     # Open shell in app container
docker-compose exec postgres psql -U developer -d myapp_development

# Restart specific service
docker-compose restart app
```

## Advanced Docker Compose Examples

### Full-Stack Development Environment

```yaml
# docker-compose.dev.yml
version: "3.8"

services:
  # Frontend (React/Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://developer:dev_password@postgres:5432/myapp_development
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-key
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  # Database
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp_development
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

  # Database Admin
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    networks:
      - app-network

networks:
  app-network:

volumes:
  postgres-data:
```

### Production-like Environment

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

  # Application
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://app_user:secure_password@postgres:5432/myapp_production
    depends_on:
      - postgres
    networks:
      - app-network
    restart: unless-stopped

  # Database
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp_production
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:

volumes:
  postgres-data:
```

## Practical Development Workflows

### Workflow 1: Starting a New Project

```bash
# 1. Create project structure
mkdir my-fullstack-app
cd my-fullstack-app
mkdir frontend backend database

# 2. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://developer:dev_password@postgres:5432/myapp
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres-data:
EOF

# 3. Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
EOF

# 4. Start development environment
docker-compose up -d

# 5. Connect to database for setup
docker-compose exec postgres psql -U developer -d myapp
```

### Workflow 2: Daily Development

```bash
# Start your development environment
docker-compose up -d

# Check logs
docker-compose logs -f app

# Run tests
docker-compose exec app npm test

# Install new dependencies
docker-compose exec app npm install express
docker-compose restart app

# Database operations
docker-compose exec postgres psql -U developer -d myapp

# Stop everything when done
docker-compose down
```

### Workflow 3: Database Management

```bash
# Backup database
docker-compose exec postgres pg_dump -U developer myapp > backup.sql

# Restore database
docker-compose exec -T postgres psql -U developer myapp < backup.sql

# Reset database (BE CAREFUL!)
docker-compose down
docker volume rm myapp_postgres-data
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate

# Seed database
docker-compose exec app npm run seed
```

## Troubleshooting Common Issues

### Issue 1: Port Already in Use

```bash
# Error: Port 3000 is already in use
# Solution: Find what's using the port
lsof -i :3000
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 my-app
```

### Issue 2: Volume Permission Issues

```bash
# Error: Permission denied when mounting volumes
# Solution: Fix ownership
sudo chown -R $USER:$USER ./my-project

# Or run container with your user ID
docker run -u $(id -u):$(id -g) -v $(pwd):/app my-app
```

### Issue 3: Container Won't Start

```bash
# Check container status
docker ps -a

# Check logs
docker logs <container-name>

# Run container interactively to debug
docker run -it my-app /bin/sh
```

### Issue 4: Database Connection Refused

```bash
# Make sure containers are on same network
docker network ls
docker inspect <network-name>

# Check if database is ready
docker-compose exec postgres pg_isready -U developer

# Use container name as hostname in connection string
# ❌ Wrong: localhost:5432
# ✅ Correct: postgres:5432 (when containers are networked)
```

## Best Practices and Tips

### 1. Dockerfile Optimization

```dockerfile
# ✅ Good: Specific base image version
FROM node:18.16-alpine

# ❌ Bad: Latest tag (unpredictable)
FROM node:latest

# ✅ Good: Copy dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# ❌ Bad: Copy everything first (cache invalidation)
COPY . .
RUN npm install

# ✅ Good: Use .dockerignore
# Create .dockerignore with:
# node_modules
# .git
# .env
# *.log
```

### 2. Security Best Practices

```dockerfile
# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Don't include secrets in image
# ❌ Bad
ENV API_KEY=secret123

# ✅ Good: Pass at runtime
docker run -e API_KEY=secret123 my-app
```

### 3. Development vs Production

```yaml
# docker-compose.override.yml (automatically used in development)
version: '3.8'
services:
  app:
    volumes:
      - .:/app          # Mount source code
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

# docker-compose.prod.yml (for production)
version: '3.8'
services:
  app:
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    command: npm start
```

### 4. Health Checks

```dockerfile
# Add health check to Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```yaml
# Or in docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Sample Project: Complete Setup

Let's create a complete example project:

### Project Structure

```
my-fullstack-app/
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── package.json
├── server.js
└── database/
    └── init.sql
```

### 1. package.json

```json
{
  "name": "docker-fullstack-example",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.8.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

### 2. server.js

```javascript
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### 3. Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### 4. .dockerignore

```gitignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
```

### 5. database/init.sql

```sql
-- This file runs automatically when PostgreSQL container starts for the first time

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert some sample data
INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com');
```

### 6. docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://developer:dev_password@postgres:5432/myapp
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    depends_on:
      - postgres
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
```

### 7. Running the Project

```bash
# 1. Clone or create the project
mkdir my-fullstack-app
cd my-fullstack-app
# ... create all the files above

# 2. Start the development environment
docker-compose up -d

# 3. Check if everything is running
docker-compose ps

# 4. Test the API
curl http://localhost:3000/health
curl http://localhost:3000/users

# 5. Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Cooper", "email": "alice@example.com"}'

# 6. Access pgAdmin at http://localhost:8080
# Login: admin@example.com / admin
# Add server: postgres (host), 5432 (port), developer (user), dev_password (password)

# 7. Connect to database directly
docker-compose exec postgres psql -U developer -d myapp

# 8. View logs
docker-compose logs -f app

# 9. Stop everything
docker-compose down
```

## Summary: Key Docker Concepts

### Images vs Containers

- **Image**: Recipe/blueprint (immutable)
- **Container**: Running instance of image (can change)

### Networking

- Containers on same network can communicate using container names
- Use port mapping to expose services to host
- Custom networks provide isolation and better control

### Volumes

- **Named volumes**: Best for production data (managed by Docker)
- **Bind mounts**: Best for development (direct host directory access)
- **Anonymous volumes**: Temporary data that Docker manages

### Best Practices

1. Use specific image tags, not `latest`
2. Copy dependency files before source code (better caching)
3. Use non-root users for security
4. Add health checks
5. Use .dockerignore to exclude unnecessary files
6. Use multi-stage builds for smaller production images

### Development Workflow

1. Create Dockerfile and docker-compose.yml
2. Use bind mounts for live code reloading
3. Use named volumes for database persistence
4. Access services via localhost with port mapping
5. Use container names for inter-service communication

Remember: Docker is like having a magical moving truck that can pack up your  
entire development environment and move it anywhere, setting up exactly the  
same way every time! 🚚✨
