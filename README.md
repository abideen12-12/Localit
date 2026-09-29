# Localit — Local Multi-Shop Delivery Platform

**Localit** is an open local commerce marketplace connecting independent neighborhood stores with nearby consumers. Unlike warehouse-centric quick-commerce models (e.g. Blinkit/Zepto) that operate centralized dark stores, **Localit empowers local brick-and-mortar merchants** to run their own digital storefronts, set their own prices, and fulfill neighborhood orders while providing consumers with an intuitive, unified shopping experience.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v7, Tailwind CSS v4, Lucide Icons, Axios, Context API |
| **Backend** | Node.js (v22), Express.js, REST API architecture, JWT authentication, Bcrypt password hashing |
| **Database** | PostgreSQL (Relational schema with foreign keys, compound indexes, unique constraints) |
| **ORM** | Prisma ORM with atomic ACID transactions (`prisma.$transaction`) |
| **Payments** | Pluggable Payment Abstraction Layer supporting `ONLINE_MOCK` and `CASH_ON_DELIVERY` |
| **Realtime/UX** | In-app notification center, polling order tracking stepper, multi-shop cart conflict detection |

---

## 📋 System Highlights & Core Business Rules

### 1. Single-Shop Cart Enforcement (Rule #1)
In Localit Version 1, a customer's cart belongs strictly to **one shop at a time** to avoid multi-shop order splitting complexities.
- If a customer attempts to add an item from a different shop, the system prevents mixing and presents an interactive **Multi-Shop Conflict Modal**:
  > *"Your cart already contains items from [Shop A]. Clear your cart and add this item from [Shop B]?"*
- Customers can choose to keep their existing cart or clear it and start fresh with the new merchant.

### 2. Historical Price & Name Freeze (Rule #2)
To protect financial and contractual integrity:
- When an order is placed, an immutable snapshot of `productNameSnapshot` and `priceSnapshot` is written to `OrderItems`.
- If a shop owner subsequently updates their product name or raises their price (e.g., Milk from ₹50 to ₹60), existing historical orders retain the exact price paid (₹50).

### 3. ACID Transactional Fulfillment & Restocking
- Order placement executes inside a PostgreSQL serial transaction: validates stock, reserves inventory, creates order, records payment, and empties cart.
- If an order is cancelled prior to dispatch (`PENDING` or `CONFIRMED`), the reserved stock is automatically and transactionally restored to the merchant's inventory.

### 4. Verified Purchase Reviews Only
- Customer reviews and 1–5 star ratings can only be submitted for orders with status `DELIVERED`.
- Duplicate reviews for the same order and product are strictly blocked at the database constraint level.

### 5. Merchant Governance & Shop Verification
- Newly registered shops receive `verificationStatus = PENDING`.
- Public shoppers only see `APPROVED` shops. Platform administrators review merchant credentials and can `APPROVE`, `REJECT`, or `SUSPEND` shops.

---

## 👥 Role-Based Access Control (RBAC)

The platform provides dedicated workflows for three roles:

| Capability | Customer | Shop Owner | Platform Admin |
|---|:---:|:---:|:---:|
| Browse & search shops and products | ✅ | ✅ | ✅ |
| Multi-shop price comparison | ✅ | ✅ | ✅ |
| Manage personal addresses | ✅ | ❌ | ❌ |
| Place orders & track delivery status | ✅ | ❌ | ❌ |
| Leave verified purchase reviews | ✅ | ❌ | ❌ |
| Manage store profile, hours & delivery radius | ❌ | ✅ (Own Shop) | ✅ (All) |
| Manage store products, stock & pricing | ❌ | ✅ (Own Shop) | ❌ |
| Fulfill orders through preparation pipeline | ❌ | ✅ (Own Shop) | ❌ |
| Shop Owner Dashboard (revenue & inventory telemetry) | ❌ | ✅ | ❌ |
| Platform Admin Dashboard (GMV, order volume, metrics) | ❌ | ❌ | ✅ |
| Approve / Reject / Suspend shops | ❌ | ❌ | ✅ |
| Manage global product categories | ❌ | ❌ | ✅ |
| Manage promotional coupon codes | ❌ | ❌ | ✅ |
| Global user governance & account activation | ❌ | ❌ | ✅ |

---

## 🗄️ Relational Database Schema

Localit uses a relational schema designed in Prisma:

- **User**: Authentication, role (`CUSTOMER`, `SHOP_OWNER`, `ADMIN`), account status (`isActive`).
- **Address**: Delivery addresses with geocoordinates (`latitude`, `longitude`).
- **Shop**: Store details, geo-location, operational status (`OPEN`, `CLOSED`, `TEMPORARILY_UNAVAILABLE`), verification status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`), delivery radius, and delivery fee.
- **Category**: Global taxonomies managed by Admin.
- **Product**: Per-shop inventory, SKU, pricing, unit, and auto-computed `OUT_OF_STOCK` status.
- **Cart & CartItem**: Per-user cart bound to a single `shopId`.
- **Order & OrderItem**: Order lifecycle states (`PENDING`, `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) with historical snapshots.
- **Payment**: Payment records (`ONLINE_MOCK`, `CASH_ON_DELIVERY`, `STRIPE`, `RAZORPAY`) with transaction identifiers.
- **Review**: Verified rating & feedback linked to order and product.
- **Coupon**: Promotional codes with percentage or flat discounts, min order, and expiration.
- **Notification**: In-app alerts for order state changes and system announcements.

---

## 🔑 Demo Seed Accounts

The platform includes pre-populated seed data for immediate demonstration:

| Role | Email | Password | Notes |
|---|---|---|---|
| **Platform Admin** | `admin@localit.market` | `admin123` | Full access to platform audits & metrics |
| **Shop Owner 1** | `owner1@localit.market` | `password123` | Manages *Green Valley Organic Grocers* |
| **Shop Owner 2** | `owner2@localit.market` | `password123` | Manages *Daily Needs Supermarket* |
| **Shop Owner 3** | `owner3@localit.market` | `password123` | Manages *Krishna Dairy & Provision Store* |
| **Customer** | `customer1@localit.market` | `password123` | Customer with saved addresses & orders |

*(Quick-login presets are also available as one-click buttons on the Login page!)*

### Available Promotional Coupons
- `WELCOME10`: 10% discount on orders over ₹200 (Max savings ₹50)
- `LOCALIT50`: Flat ₹50 discount on orders over ₹300

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v22)
- **PostgreSQL**: v14+ (Local cluster running on port 5435 or standard 5432)
- **npm** or **pnpm**

### 1. Database & Backend Configuration

Navigate to the `server/` directory:
```bash
cd server
npm install
```

Create a `.env` file in `server/` (configured by default for port 5435):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres@127.0.0.1:5435/localit_db?schema=public"
JWT_SECRET="localit_super_secret_production_jwt_key_2026_secure"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

Sync database schema and run seed dataset:
```bash
npx prisma db push
node src/prisma/seed.js
```

Start the backend server:
```bash
npm run dev
# Server will run on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 2. Frontend Configuration

Navigate to the `client/` directory:
```bash
cd client
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 📡 REST API Reference Index

### Authentication & Profile (`/api/auth`)
- `POST /api/auth/register` — Register a customer or shop owner
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/profile` — Fetch current user profile
- `PUT /api/auth/profile` — Update name or phone number
- `PUT /api/auth/change-password` — Change account password

### Customer Addresses (`/api/addresses`)
- `GET /api/addresses` — List saved delivery addresses
- `POST /api/addresses` — Add new delivery address
- `PUT /api/addresses/:id` — Update delivery address
- `DELETE /api/addresses/:id` — Delete address
- `PATCH /api/addresses/:id/default` — Set as primary address

### Shops & Discovery (`/api/shops`)
- `GET /api/shops` — Browse verified active shops (supports category, search, sorting)
- `GET /api/shops/:id` — Get shop details, opening hours & delivery rules
- `GET /api/shops/:id/products` — Get product catalog for a specific shop

### Global Product Search (`/api/products`)
- `GET /api/products/search?q=milk` — Cross-shop price comparison search
- `GET /api/products/categories` — Browse public category catalog

### Cart Engine (`/api/cart`)
- `GET /api/cart` — View current single-shop cart
- `POST /api/cart/items` — Add item (with multi-shop conflict guard)
- `PUT /api/cart/items/:id` — Update item quantity
- `DELETE /api/cart/items/:id` — Remove item from cart
- `DELETE /api/cart` — Clear entire cart

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` — ACID transactional order checkout
- `GET /api/orders` — Customer order history
- `GET /api/orders/:id` — Detailed order view & live tracking status
- `PATCH /api/orders/:id/cancel` — Cancel order with auto-inventory restock

### Reviews (`/api/reviews`)
- `POST /api/reviews` — Submit verified review for delivered purchase
- `GET /api/reviews/shop/:shopId` — View customer reviews for a shop

### Coupons (`/api/coupons`)
- `POST /api/coupons/validate` — Validate voucher code for checkout cart
- `GET /api/coupons` — Admin coupon catalog
- `POST /api/coupons` — Admin create coupon
- `PATCH /api/coupons/:id/toggle` — Admin enable/disable coupon

### Shop Owner Operations (`/api/owner`)
- `GET /api/owner/dashboard` — Merchant KPI metrics (revenue, orders, low stock)
- `GET /api/owner/shop` — Get merchant's store configuration
- `PUT /api/owner/shop` — Update store details, status (OPEN/CLOSED), delivery fee
- `GET /api/owner/products` — Manage store product inventory
- `POST /api/owner/products` — Add new product
- `PUT /api/owner/products/:id` — Update price, stock, details
- `DELETE /api/owner/products/:id` — Deactivate product
- `GET /api/owner/orders` — View incoming shop orders
- `PATCH /api/owner/orders/:id/status` — Transition fulfillment pipeline

### Admin Ecosystem Operations (`/api/admin`)
- `GET /api/admin/dashboard` — Ecosystem telemetry & gross merchandise value
- `GET /api/admin/shops` — Audit shops by verification status
- `PATCH /api/admin/shops/:id/status` — Approve, Reject, or Suspend shop
- `GET /api/admin/users` — Directory of registered accounts
- `PATCH /api/admin/users/:id/toggle` — Suspend or reactivate user
- `GET /api/admin/orders` — Global platform order monitor
- `POST /api/admin/categories` — Add global category

---

## 🏆 Checkpoint Milestones Achieved

- [x] **Checkpoint 0**: System & DB Architecture, ERD Specification, Repository Setup
- [x] **Checkpoint 1**: Base Application, Isolated PostgreSQL 17 Setup, Prisma Schemas, Express API, Vite Frontend
- [x] **Checkpoint 2**: JWT Authentication, RBAC (`CUSTOMER`, `SHOP_OWNER`, `ADMIN`), Addresses
- [x] **Checkpoint 3**: Shop Discovery, Geolocation Haversine Distance, Verification Workflow
- [x] **Checkpoint 4**: Category Catalog, Multi-Shop Pricing Engine, Global Cross-Shop Search
- [x] **Checkpoint 5**: Cart System with Single-Shop Guard & Conflict Modal
- [x] **Checkpoint 6**: Pluggable Payment Abstraction, ACID Transactional Checkout, Price Freeze Snapshot, 6-Step Live Order Tracking
- [x] **Checkpoint 7**: Shop Owner Fulfillment Hub & Admin Platform Governance Console
- [x] **Checkpoint 8**: Verified Purchase Reviews, Promo Coupon Engine, In-App Notifications, Seed Dataset, Full Documentation & Production Build
