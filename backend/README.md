# Doctor Loyalty Reward Backend API

Backend API server for the Doctor Loyalty Reward Tracking application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Role-based Authorization** (user, admin, doctor)
- **Error Handling** middleware
- **Input Validation** with express-validator
- **CORS** enabled for frontend integration
- **Modular Architecture** with separation of concerns

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── userController.js    # User business logic
│   └── postController.js    # Post business logic
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Request validation helper
├── models/
│   ├── User.js              # User Mongoose schema
│   └── Post.js              # Post Mongoose schema
├── routes/
│   ├── userRoutes.js        # User API routes
│   └── postRoutes.js        # Post API routes
├── server.js                # Application entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` file and set your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/doctor-loyalty
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB:**
   - Local MongoDB: Make sure MongoDB is running on your machine
   - MongoDB Atlas: Use your Atlas connection string in `MONGODB_URI`

5. **Run the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile (Protected)
- `PUT /api/users/me` - Update current user profile (Protected)
- `DELETE /api/users/me` - Delete current user account (Protected)

### User Routes

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Protected)

### Post Routes

- `GET /api/posts` - Get all posts (Public)
- `GET /api/posts/:id` - Get single post by ID (Public)
- `POST /api/posts` - Create new post (Protected)
- `PUT /api/posts/:id` - Update post (Protected - Author or Admin)
- `DELETE /api/posts/:id` - Delete post (Protected - Author or Admin)
- `POST /api/posts/:id/like` - Like/Unlike post (Protected)

### Health Check

- `GET /health` - Server health check

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 📝 Example API Calls

### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Post (with token)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post",
    "tags": ["tech", "tutorial"],
    "isPublished": true
  }'
```

## 🧪 Testing

Run linter:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/doctor-loyalty` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT token expiration | `7d` |

## 🏗️ Architecture

- **Controllers**: Handle business logic and HTTP requests/responses
- **Models**: Define database schemas with Mongoose
- **Routes**: Define API endpoints and middleware chain
- **Middleware**: Authentication, validation, and error handling
- **Config**: Database and environment configuration

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `express-validator` - Input validation

### Development
- `eslint` - Code linting
- `jest` - Testing framework
- `nodemon` - Development auto-reload

## 🚨 Error Handling

All errors are handled by the global error handler middleware. Errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "stack": "Error stack (development only)"
}
```

## 📄 License

ISC

## 👥 Contributing

1. Follow the existing code structure
2. Add comments for complex logic
3. Ensure error handling for async operations
4. Run linter before committing

