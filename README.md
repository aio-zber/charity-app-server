# Charity App Backend

A Node.js backend API built with Express.js, TypeScript, Prisma ORM, and PostgreSQL for the Charity App platform.

## Features

- **User Authentication**: Username/password authentication with JWT tokens
- **Admin Management**: Separate admin authentication and management capabilities
- **Donation System**: Create, read, and track donations with comprehensive analytics
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Security**: Helmet, CORS, rate limiting, and bcrypt password hashing

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `POST /register` - Create new admin (admin only)
- `GET /dashboard` - Get dashboard statistics (admin only)
- `GET /users` - Get all users with pagination (admin only)
- `POST /users` - Create new user (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

### Donation Routes (`/api/donations`)
- `POST /` - Create donation (user only)
- `GET /my-donations` - Get user's donations (user only)
- `GET /all` - Get all donations (admin only)
- `POST /admin` - Create donation for user (admin only)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/charity_app?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```

3. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

- **User**: id, username, password, age, createdAt, updatedAt
- **Admin**: id, username, password, createdAt, updatedAt  
- **Donation**: id, amount, userId, createdAt, updatedAt

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Helmet security headers