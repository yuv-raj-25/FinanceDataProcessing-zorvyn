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

### 6. Data Persistence
- **Approach**: Chosen stack is a **Relational Database (PostgreSQL)**. Financial entries mandate rigorous schema consistency, reliable ACID transactions, and robust relational linking between users and ledgers (`ON DELETE CASCADE`).
- **Initialization**: Database migrations are handled programmatically. When the index script boots server-side, it scans `src/db/migrations/` and processes the `.sql` schema sequentially.

---

## Getting Started

### 1. Launch the Database
The project utilizes Docker for guaranteed local consistency. Spin up the persistence layer:
```bash
docker-compose up -d
```
*(As defined in `docker-compose.yml`, the database will automatically bind to port `5431`.)*

### 2. Environment Variables
Create a `.env` file in the root directory mirroring the necessary connection strings:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5431
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=finance_db
JWT_SECRET=super_secret_jwt_finance_key_123
```

### 3. Install & Start
Install Node dependencies and boot the server in dev mode using `tsx`:
```bash
npm install
npm run dev
```

### What to Expect on Boot
Upon startup, the server automatically reads `src/db/migrations/001_initial_schema.sql` and applies the schema to your fresh PostgreSQL instance. Your terminal will display:
```
⏳ Running database migrations...
  ✅ Applied migration: 001_initial_schema.sql
✅ All database migrations applied successfully.
Server running on port 5000
```
