# Doctor Loyalty Tracking Management System

A comprehensive full-stack application for tracking and managing doctor loyalty rewards and transactions. Built with MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### Backend Features
- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Role-based Authorization** (doctor, executive, admin, superadmin, accountant)
- **Location Management** - CRUD operations for locations
- **Transaction Management** - Track transactions with doctor, executive, location, amount, payment mode, status
- **Statistics API** - Get transaction statistics and summaries
- **Error Handling** middleware
- **Input Validation** with express-validator
- **CORS** enabled for frontend integration

### Frontend Features
- **Modern React UI** with responsive design
- **Authentication** - Login and session management
- **Loyalty Reward Overview** - Dashboard with statistics and transaction table
- **Pagination** - Display 10 transactions per page with navigation
- **Search & Filter** - Search by doctor/executive name, filter by status
- **Settings** - User management (add new users with different roles)
- **Real-time Data** - Fetch data from API endpoints
- **SVG Icons** - No external icon library dependencies

## 📁 Project Structure

```
Doctor_Loyalty_Tracking_Management/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js    # User business logic
│   │   ├── locationController.js # Location CRUD operations
│   │   └── transactionController.js # Transaction CRUD & statistics
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & authorization
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validation.js        # Request validation helper
│   ├── models/
│   │   ├── User.js              # User schema (doctor, executive, admin, etc.)
│   │   ├── Location.js          # Location schema
│   │   └── Transaction.js       # Transaction schema
│   ├── routes/
│   │   ├── userRoutes.js        # User API routes
│   │   ├── locationRoutes.js    # Location API routes
│   │   └── transactionRoutes.js # Transaction API routes
│   ├── scripts/
│   │   ├── seed.js              # Seed script for dummy data
│   │   └── addUser.js           # Script to add individual users
│   └── server.js                # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx        # Login component
│   │   │   ├── LoyaltyRewardOverview.jsx # Main dashboard
│   │   │   ├── Settings.jsx     # User management
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   └── TopNav.jsx       # Top navigation bar
│   │   ├── services/
│   │   │   ├── User.js          # User API service
│   │   │   ├── Location.js      # Location API service
│   │   │   └── Transaction.js   # Transaction API service
│   │   └── App.jsx              # Main app component
│   └── urlConfig.js             # API endpoint configuration
└── README.md                    # This file
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```
   This will create:
   - 3 locations (Mandya, Ramanagara, K R Pete)
   - 9 users (doctors, executives, admin, superadmin, accountant)
   - 50 dummy transactions

5. **Start the server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 📊 Database Schema

### User Model
- `name` - String (required)
- `email` - String (required, unique)
- `password` - String (required, hashed)
- `role` - Enum: 'doctor', 'executive', 'admin', 'superadmin', 'accountant'
- `locationId` - ObjectId (reference to Location)

### Location Model
- `name` - String (required, unique)
- `address` - String (required)

### Transaction Model
- `doctorId` - ObjectId (reference to User)
- `executiveId` - ObjectId (reference to User)
- `locationId` - ObjectId (reference to Location)
- `amount` - Number (required)
- `paymentMode` - Enum: 'Cash', 'Online Transfer'
- `monthYear` - String (format: MM/YYYY)
- `status` - Enum: 'started', 'IN progress', 'pending', 'completed'
- `deliveryDate` - Date (optional)

## 🔐 API Endpoints

### Authentication
- `POST /api/users/login` - Login user
- `POST /api/users/register` - Register new user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user account

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create location (admin only)
- `PUT /api/locations/:id` - Update location (admin only)
- `DELETE /api/locations/:id` - Delete location (admin only)

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/statistics` - Get transaction statistics
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction (admin only)

## 🔑 Test Credentials

After running the seed script, you can login with:

- **Doctor:** `doctor1@example.com` / `doctor123`
- **Executive:** `executive1@example.com` / `executive123`
- **Admin:** `admin@example.com` / `admin123`
- **Test User:** `test@gmail.com` / `sindhu@123`

## 🎨 Frontend Features Details

### Dashboard (Loyalty Reward Overview)
- **Statistics Cards:** Displays delivered, in-progress, pending counts, and cash in hand
- **Transaction Table:** 
  - Shows 10 transactions per page
  - Pagination controls for navigation
  - Search by doctor or executive name
  - Filter by transaction status
  - Real-time data from API

### Settings Page
- Add new users with different roles
- Select location for new users
- Form validation and error handling

## 🚀 Deployment

### Backend Deployment
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas IP whitelisting is configured
3. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist` folder to platforms like Vercel, Netlify, or AWS S3

## 🧪 Testing

### Run Backend Linter:
```bash
cd backend
npm run lint
```

### Run Frontend Linter:
```bash
cd frontend
npm run lint
```

## 📝 Scripts

### Backend Scripts
- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run seed` - Seed database with dummy data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

## 👥 Authors

- Development Team

## 🔗 Links

- Backend API: `http://localhost:5000`
- Frontend App: `http://localhost:5173`
- API Health Check: `http://localhost:5000/health`

---

For more detailed information, check the README files in `backend/` and `frontend/` directories.

