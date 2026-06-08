# Dinven — Inventory Management System

A full-stack inventory and order management system built with React, Node.js/Express, and PostgreSQL. Developed as a university final project.

## Tech Stack

**Frontend**
- React 19
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Lucide React (icons)
- Axios

**Backend**
- Node.js + Express
- PostgreSQL (via `pg`)
- JWT Authentication
- bcryptjs (password hashing, cost factor 12)
- Helmet, CORS, express-rate-limit

## Features

### Admin Panel
- **Dashboard** — Real-time KPIs, revenue trends chart, order status breakdown, recent orders & top products
- **Products** — Add, delete, search inventory; low-stock alerts; PDF export
- **Orders** — Create orders (with automatic stock deduction), update status (Preparing → Shipped → Delivered), search
- **Customers** — CRM view, add/delete customers, real-time stats
- **Analytics** — Monthly revenue chart, order status distribution, top products by price
- **Exports** — One-click CSV export for products, customers, and orders (UTF-8 BOM, Excel-ready)
- **Settings** — Company info, notification preferences, security toggles (persisted to localStorage)
- **Help** — FAQ with accordion, email support link

### Customer Portal
- Customers register and log in via a separate tab
- View only their own orders (enforced server-side)
- Order detail view with product breakdown

### Security
- Role-based access control: `admin`, `employee`, `customer`
- All admin routes protected with `authenticate` + `requireAdmin` middleware
- Customer portal routes protected with `authenticate` + `requireCustomer` middleware
- Customers cannot access other customers' data
- Prices are fetched from the database on order creation — client-side prices are ignored
- Login rate-limiting (10 attempts per 15 minutes)
- Parameterized SQL queries (SQL injection prevention)
- Passwords hashed with bcrypt (cost 12)

## Project Structure

```
inventory-management/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # authenticate + requireAdmin middleware
│   ├── routes/
│   │   ├── auth.js          # login + customer registration
│   │   ├── products.js
│   │   ├── customers.js
│   │   ├── orders.js
│   │   └── customerPortal.js
│   ├── db.js                # PostgreSQL connection pool
│   ├── index.js             # Express app entry point
│   ├── migrate.js           # Database table creation script
│   ├── seed.js              # Demo data seeding script
│   ├── createUser.js        # CLI utility to create admin users
│   ├── .env.example         # Environment variable template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.js
    │   │   ├── Products.js
    │   │   ├── Orders.js
    │   │   ├── Customers.js
    │   │   ├── Analytics.js
    │   │   ├── Exports.js
    │   │   ├── Settings.js
    │   │   ├── Help.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── customer/
    │   │       ├── CustomerDashboard.js
    │   │       └── CustomerOrders.js
    │   ├── api.js            # Axios instance with auth interceptor
    │   └── App.js
    └── package.json
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/inventory-management.git
cd inventory-management
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and a strong JWT secret:

```
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=replace_with_a_strong_random_secret
```

Create the database and tables:

```bash
# Create database in PostgreSQL first
psql -U postgres -c "CREATE DATABASE inventory_db;"

# Run migrations
node migrate.js

# (Optional) Seed demo data
node seed.js
```

Create an admin user:

```bash
node createUser.js "Admin" "admin@example.com" "yourpassword" "admin"
```

Start the backend:

```bash
node index.js
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`.

## Demo Credentials

> These credentials are for the seeded demo data only.

**Admin (Staff tab)**
| Field | Value |
|-------|-------|
| Email | `admin@aluarc.com` |
| Password | `admin123` |

**Customer accounts (Customer tab)** — all use password `musteri123`

| Company | Email |
|---------|-------|
| Arman Construction Ltd. | `info@armanconstruction.com` |
| Gunes Building Co. | `sales@gunesbuilding.com` |
| Kaya Architecture | `projects@kayaarch.com` |
| Delta Building Systems Inc. | `technical@deltabuilding.com` |
| Prizma Construction & Trade | `accounting@prizma.com` |
| Boran Building Materials | `info@boranbuilding.com` |
| Elmas Aluminum Systems | `info@elmasaluminum.com` |
| YapTek Engineering | `office@yaptek.com` |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login (staff or customer) |
| POST | `/api/auth/register-customer` | — | Customer self-registration |
| GET | `/api/products` | Admin | List all products |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/customers` | Admin | List all customers |
| POST | `/api/customers` | Admin | Create customer |
| PUT | `/api/customers/:id` | Admin | Update customer |
| DELETE | `/api/customers/:id` | Admin | Delete customer |
| GET | `/api/orders` | Admin | List all orders |
| POST | `/api/orders` | Admin | Create order |
| PUT | `/api/orders/:id` | Admin | Update order status |
| GET | `/api/customer-portal/profile` | Customer | Own profile |
| GET | `/api/customer-portal/orders` | Customer | Own orders |
| GET | `/api/customer-portal/orders/:id` | Customer | Own order detail |

## License

This project was developed for academic purposes.
