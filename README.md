# Finance Data Processing API

A robust Node.js and TypeScript backend for managing financial records, designed to fulfill all assignment requirements including Role-Based Access Control (RBAC), robust Data Validation, Data Aggregation for dashboards, and PostgreSQL Data Persistence.

## Project Overview & Approach

This assignment required building a backend to process financial data while enforcing modern TypeScript configurations and strict typing. My approach focused on building a clean, scalable architectural pattern using **Express.js**, **PostgreSQL**, and **Zod**. 

Below is how each assignment requirement was addressed:

### 1. Strict TypeScript Requirements (`verbatimModuleSyntax`)
The project successfully compiles and enforces strict TypeScript module resolution (`"module": "nodenext"`, `"verbatimModuleSyntax": true`).
- **Approach**: All type-only imports (such as Express `Request` and `Response`) were explicitly marked with `import type`. CommonJS modules (like `pg` and `bcrypt`) were imported natively and destructured safely to satisfy ESM boundaries. 

### 2. Financial Records Management
A full suite of CRUD REST endpoints handles data ingestion.
- **Approach**: Built a `record.service.ts` connecting cleanly to the database. Endpoints at `/api/records` support dynamic querying, allowing the client to filter financial entries by `type`, `category`, `startDate`, and `endDate`.

### 3. Dashboard Summary APIs
Complex analytics are available without transferring mass data to the client.
- **Approach**: `dashboard.service.ts` utilizes raw SQL aggregation (such as `COALESCE`, `SUM`, `CASE`) to return optimized reporting models. Endpoints include general summaries, category totals, recent activity, and structured monthly/weekly trends.

### 4. Access Control Logic
Implemented backend-level RBAC via JWT middlewares.
- **Roles**:
  - `admin`: Full capability to create users, delete records, and manage all endpoints.
  - `analyst`: Can securely view all data and aggregated dashboard summaries, but cannot modify records.
  - `viewer`: Can securely view data, but is restricted from hitting aggregate dashboard data and mutating records.
- **Approach**: Written cleanly in `role.middleware.ts` acting as route guards (e.g., `router.post('/', requireRole(['admin']), ...)`.

### 5. Validation and Error Handling
Input is strictly guarded to prevent malformed data from reaching the database.
- **Approach**: Adopted **Zod**, a modern TS-first schema validation library. Every request traverses `validate.middleware.ts` before hitting the controller.
- **Benefit**: Invalid UUIDs, poor dates, and negative amounts are caught immediately. Errors are universally formatted using a standardized `ApiError` utility, delivering `HTTP 422` with a mapped list of specific field failures.

### 6. Data Persistence & Modeling
- **Approach**: Chosen stack is a **Relational Database (PostgreSQL)**. Financial entries mandate rigorous schema consistency, reliable ACID transactions, and robust relational linking between users and ledgers (`ON DELETE CASCADE`).
- **Data Modeling & Integrity**:
  - Adopted strictly enforced **CHECK constraints** to guarantee data corruption is mathematically impossible at the database level (e.g., `amount > 0` and `type IN ('income', 'expense')`). 
- **High-Performance Indexing**: 
  - Standardized **B-Tree Composite Indexes** were applied to support massive analytical queries efficiently.
  - Index `(user_id, date DESC)` allows fast loading of recent history per user.
  - Index `(user_id, category)` facilitates highly optimized aggregation scans for the dashboard's category breakdown summaries. 
- **Initialization**: Database migrations are handled programmatically and idempotently. When the index script boots server-side, it scans `src/db/migrations/` and processes the `.sql` schema sequentially (`001_...` then `002_...`).

### 7. Optional Enhancements
- **Token-based Authentication (JWT)**: Fully implemented JSON Web Tokens (`jsonwebtoken`) for decentralized authentication. 
- **Pagination & Search**: The `GET /api/records` endpoint supports robust keyword-based text searching (using Postgres `ILIKE`) alongside comprehensive offset/limit pagination payloads mapping directly to the response metadata array.
- **Rate Limiting**: Integrated `express-rate-limit` as a global application boundary. It mathematically bounds inbound traffic, strictly allowing `100 requests per 15 minutes` window per IP location. Requests breaching this logic return an automated `429 Too Many Requests` API Error.
- **Soft Delete Functionality**: Erased historical destruction mapping! When `DELETE /api/records/:id` is triggered, the row is effectively vaulted internally via a `deleted_at` timestamp. Global backend read operations (including raw Dashboard metric aggregates) inherently isolate and mathematically filter out vaulted rows cleanly without breaking core tracking logs.
- **Production-Ready Observability & Security**: Implemented a deep DB Health Check (`/health`), unique Request Correlation logging (`X-Request-Id`), automated Graceful Shutdown hooks, and `helmet` for strict HTTP security headers.

---

## Getting Started (Zero to Local Server)

If you have just cloned this repository from GitHub, follow these exact steps to get the application running locally in under two minutes!

### Prerequisites
- **Node.js**: Standard JavaScript runtime (v18 or higher recommended).
- **Docker Desktop**: The easiest way to run PostgreSQL without installing database binaries directly into your OS.

### 1. Clone the Repository
Open your terminal and clone the code:
```bash
git clone https://github.com/yuv-raj-25/FinanceDataProcessing-zorvyn
cd FinanceDataProcessing-zorvyn
```

### 2. Install Node Dependencies
Install all required backend dependencies (Express, Typescript, Zod, pg, etc.):
```bash
npm install
```

### 3. Launch the Postgres Database
The project utilizes Docker for guaranteed local consistency. Spin up the persistence layer in the background:
```bash
docker-compose up -d
```
*(The database will automatically boot and bind to port `5431` on your machine.)*

### 4. Provide Environment Variables
Create a `.env` file in the root directory of the project (at the same level as `package.json`) and paste in these necessary strings to link up to Docker:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5431
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=finance_db
JWT_SECRET=super_secret_jwt_finance_key_123
```

### 5. Start the API Server
Boot the backend application using `tsx` watch mode:
```bash
npm run dev
```

---

### What to Expect on Boot
Upon startup, the server automatically reads `src/db/migrations/001_initial_schema.sql` and builds the relational framework in your fresh PostgreSQL instance. Your terminal should display:
```
⏳ Running database migrations...
  ✅ Applied migration: 001_initial_schema.sql
✅ All database migrations applied successfully.
Server running on port 5000
```


## Comprehensive Postman Usage Guide

This guide walks you through navigating the entire API lifecycle, assuming you are utilizing a REST client like **Postman** or **Insomnia**.

### 1. Bootstrapping & Logging In (Authentication)

Because this API uses strict Role-Based Access Control, you first need to inject an `admin` via the terminal as explained in step 4 in the Getting Started section. Once created:

- **Endpoint**: `POST http://localhost:5000/api/auth/login`
- **Body (JSON)**:
  ```json
  {
    "email": "admin@example.com",
    "password": "secure_password_123"
  }
  ```
- **Action**: Hit `Send`. Copy the random `token` string from the JSON response.
- **Next Steps**: For **every subsequent request below**, go to the **Authorization** tab in Postman, select **Bearer Token**, and paste this token in the box.

### 2. Creating Subordinate Users (RBAC in action)

Only an `admin` can create employees.
- **Endpoint**: `POST http://localhost:5000/api/users/`
- **Headers**: Authorization -> Bearer Token (Paste Admin Token)
- **Body (JSON)**:
  ```json
  {
    "email": "steve@example.com",
    "password": "steves_password",
    "role": "analyst" 
  }
  ```
*(Options for role: `admin`, `analyst`, `viewer`)*

### 3. Managing Financial Data (The Records API)

Now let's populate the financial ledger. *Note: Viewers cannot create records.*

**A. Create a Financial Record**
- **Endpoint**: `POST http://localhost:5000/api/records/`
- **Body (JSON)**:
  ```json
  {
    "type": "income",
    "amount": 5500.00,
    "category": "freelance",
    "date": "2026-04-07",
    "description": "Website redesign project"
  }
  ```
  *(Try passing a negative amount or an invalid date, and notice the `422 Unprocessable Entity` Zod validation error!)*

**B. Retrieve Financial Records**
- **Endpoint**: `GET http://localhost:5000/api/records/`
- **Query Params**: You can add URL parameters to filter efficiently. Example: `?type=income&page=1&limit=10`

**C. Update / Soft-Delete a Record**
- Copy an `id` (uuid) from the GET response.
- **Endpoint**: `DELETE http://localhost:5000/api/records/:id`
*(If you are logged in as an `analyst` or `viewer`, this destructive action will be blocked by a `403 Forbidden` error.)*

### 4. Viewing the Dashboard (Analytics)

Once you have populated a handful of `income` and `expense` records, you can test the raw SQL aggregation APIs. *(Note: `viewer` roles are restricted from these endpoints).*

**A. Core Summary Metrics**
- **Endpoint**: `GET http://localhost:5000/api/dashboard/summary`
- **Returns**: Calculates Net Balance, Total Income, and Total Expense dynamically.

**B. Category Breakdown**
- **Endpoint**: `GET http://localhost:5000/api/dashboard/category-totals`
- **Returns**: Groups all your expenses and incomes by category buckets (e.g., how much was spent on "groceries" vs "rent").



### 4. Bootstrapping Your First Admin

Because the application strictly enforces Role-Based Access Control (RBAC), only an `admin` can create other users. To solve this "chicken-and-egg" dilemma and gain access, you can run a quick one-off script to inject the first admin straight into the database.

Run this command from the root of the project:
```bash
npx tsx -e "import { UserService } from './src/services/user.service.ts'; UserService.createUser('admin@example.com', 'secure_password', 'admin').then(() => { console.log('Admin seeded!'); process.exit(0) }).catch(console.error);"
```

Now you can send a `POST` request to `http://localhost:5000/api/auth/login` to receive your JWT:
```json
{
  "email": "admin@example.com",
  "password": "secure_password"
}
```

### 5. Testing the Role-Based Views (RBAC)

To physically verify the role limitations, inject your `admin` token into your HTTP Headers (`Authorization: Bearer <token>`). As an `admin` you have absolute authority over the endpoints. 

You can test the exact boundaries by mapping lower-tier roles:
1. **Create an Analyst**: Send a `POST` to `/api/users/` (Must be an admin) containing `"role": "analyst"`. Log in with their new credentials. You'll find you can successfully request `/api/dashboard/summary`, but if you try to `DELETE /api/records/:id`, the server fires a `403 Forbidden`.
2. **Create a Viewer**: Send a `POST` to `/api/users/` containing `"role": "viewer"`. Log in as this viewer. Not only can you not delete records, but if you attempt to view aggregate company data at `GET /api/dashboard/summary`, you will be rejected with a `403 Forbidden`. 
3. **Revocation**: As an admin, you can test account suspension by firing `PUT /api/users/:id/status` and passing `"status": "inactive"`. Even with a valid token, that user will be instantly blacklisted from the backend!

---

## API Explanation

Here is a rapid breakdown of the primary endpoints the system exposes:

- **System & Observability**
  - `GET /health`: Deep database health check returning system connectivity details and latency.
- **Authentication (`/api/auth`)**
  - `POST /login`: Accepts email/password and returns a signed JWT.
- **Records (`/api/records`)**
  - `GET /`: Retrieve paginated records (Supports queries: `page`, `limit`, `type`, `category`, `search`, `startDate`, `endDate`).
  - `POST /`: Create a new financial record.
  - `GET /:id`: Fetch a specific record.
  - `PUT /:id`: Update an existing record.
  - `DELETE /:id`: Soft-delete a record.
- **Dashboard (`/api/dashboard`)**
  - `GET /summary`: Core metrics (Total Income, Total Expense, Balance).
  - `GET /category-totals`: Breakdown of expenses/incomes by category.
  - `GET /recent`: Fetches 5 most recent activities.

---

## Assumptions Made

During the architectural design, a few assumptions were mapped:
- **Currency Storage**: Stored as `DECIMAL(10,2)` in PostgreSQL to guarantee exact mathematical tracking, assuming standard minimal two-decimal fiat precision.
- **Stateless Authentication**: Assuming horizontal scaling capability, sessions are intentionally stateless via JWTs rather than stored in Redis or memory.
- **Deleted Data Value**: It's assumed transactional history is critical; therefore, "deleting" a record implies a soft-delete (appending a `deleted_at` timestamp) to preserve historical accuracy rather than a hard database `DROP`.
- **Pre-configured Roles**: Since user-registration was not detailed in the strict requirements, it is assumed initial users and their exact roles (`admin`, `analyst`, `viewer`) are either database seeded or created through a separate internal secure administrative procedure.

---

## Tradeoffs Considered

- **Raw SQL `pg` Driver vs. ORMs (e.g., Prisma, TypeORM)**: 
  - *Tradeoff*: Chose to write raw parameterized SQL utilizing the `pg` pool. While an ORM would have dramatically accelerated initial development and type-mapping, raw SQL was deliberately selected to guarantee absolute granular control over the complex analytical `GROUP BY` aggregations required by the dashboard service.
- **Client-Side Framework Integration**: 
  - *Tradeoff*: The backend serves pure generic JSON rather than implementing a tightly coupled server-side template engine (like EJS or Pug). This cleanly limits concerns, but requires a separate front-end client build to actually visualize the data.
- **Pagination Strategy**:
  - *Tradeoff*: Used `OFFSET / LIMIT` pagination. While it is incredibly easy to navigate and implement for simple applications and queries, it could theoretically experience performance drag if scaled to tens of millions of rows compared to cursor-based pagination. Given typical individual financial user datasets, `OFFSET` remains highly optimal, stable, and practical here.

---
