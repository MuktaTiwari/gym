# 🏋️ FitCore — Gym Management System SaaS

FitCore is a modern, high-performance, and feature-rich Gym Management System SaaS designed for gyms, fitness clubs, and wellness centers. It provides a robust, dual-component architecture to manage multiple gym branches, membership plans, member onboarding, automated status tracking, attendance, and analytics.

---

## 🚀 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- Secure token-based authentication (JWT Access & Refresh tokens).
- Dynamic user roles: **Super Administrator**, **Gym Owner / Manager**, and **Member**.
- Safe route guards and middleware for backend endpoints and frontend views.

### 🏢 2. Multi-Gym / Franchise Management
- Manage multiple physical gym locations under a single unified dashboard.
- Store branch addresses, operational details, and contact configurations.

### 👥 3. Member & Profile Management
- Complete CRUD capabilities for gym members.
- Link members to specific gym branches and select active subscription plans.
- Dynamic search, filters, and status flags (Active, Expired, Suspended).

### 💳 4. Flexible Plan & Pricing Engine
- Create and edit subscription plans (e.g., Monthly, Quarterly, Annual, VIP).
- Dynamic pricing, validity periods, and custom features selection.

### 📅 5. Attendance & Analytics Dashboard
- Interactive visual dashboards featuring member check-ins, package distributions, and revenue logs powered by **Recharts**.
- Actionable business metrics for managers to oversee membership growth trends at a glance.

---

## 🛠️ Technology Stack

| Component | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend** | React (v18) + Vite + TypeScript | React Router (v6), TanStack Query (v5), Zustand, TailwindCSS, Framer Motion, Lucide Icons, Recharts, React Hook Form |
| **Backend** | Node.js + Express + TypeScript | Mongoose (MongoDB ODM), Zod (Validation), JWT, Bcrypt, Helmet, Morgan, ts-node-dev |
| **Database** | MongoDB | Fully document-oriented schema design with Mongoose validations |

---

## 📂 Project Directory Structure

```text
gym/
├── backend/                       # Express & Node.js API Service
│   ├── src/
│   │   ├── config/                # Environment config loaders
│   │   ├── enums/                 # Application enums (Roles, Statuses, etc.)
│   │   ├── features/              # Modular controller routes (auth, gyms, members, plans, users)
│   │   ├── middleware/            # Auth gates, request validations, error handlers
│   │   ├── models/                # Mongoose models & schemas
│   │   ├── scripts/               # Utility scripts (e.g., seeding super-admins)
│   │   ├── utils/                 # Utility functions & custom errors
│   │   ├── app.ts                 # Express app initialization
│   │   └── server.ts              # Server runner/listener
│   ├── .env.example               # Template for backend secrets
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # React SPA with Vite
│   ├── src/
│   │   ├── assets/                # Images, logo assets, styles
│   │   ├── components/            # Reusable core UI components
│   │   ├── features/              # Page modules (attendance, dashboard, plans, etc.)
│   │   ├── hooks/                 # Custom React hooks (queries & mutations)
│   │   ├── lib/                   # Axios instances and client configs
│   │   ├── router/                # React Router setup
│   │   ├── store/                 # Zustand global stores
│   │   ├── types/                 # Shared TypeScript definitions
│   │   ├── App.tsx                # Main layout shell
│   │   └── main.tsx               # Client entry point
│   ├── .env.example               # Template for API endpoint setup
│   ├── package.json
│   └── tailwind.config.js
```

---

## 🏁 Getting Started

### 📋 Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.x or above recommended)
- **npm** (v9.x or above)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI)

---

### 📡 1. Backend Setup & Run

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy the example environment file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your custom keys (e.g., `MONGODB_URI`, `ACCESS_TOKEN_SECRET`).

4. **Seed the Super Admin Account:**
   - To seed the default super-admin user in your database, execute the seeding script:
     ```bash
     npx ts-node src/scripts/seed-super-admin.ts
     ```
     *Default seed credentials created: `admin@fitcore.com` / `SuperSecretPassword123!`*

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The backend API will start on **`http://localhost:5000`** (or your specified `PORT`).

---

### 💻 2. Frontend Setup & Run

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy the example environment file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Ensure `VITE_API_URL` points to your running backend API instance (normally `http://localhost:5000/api/v1`).

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend hot-reloading development server will boot on **`http://localhost:5173`** (or your next available port). Open this address in your browser!

---

## 🚀 Build for Production

### Production Backend Build
To compile the TypeScript backend source code into optimized JavaScript:
```bash
cd backend
npm run build
npm start
```
This builds the files into the `dist/` folder and starts the server via compiled code.

### Production Frontend Build
To compile and bundle the React application:
```bash
cd frontend
npm run build
```
This produces a production-optimized `dist/` directory that is ready to be hosted on static hosting services (like Netlify, Vercel, or AWS S3).

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more details.