import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from "./app.js";
import { pool } from "./db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

async function runMigrations() {
  console.log('⏳ Running database migrations...');
  const migrationsDir = path.join(__dirname, 'db/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`  ✅ Applied migration: ${file}`);
  }
  console.log('✅ All database migrations applied successfully.');
}

async function startServer() {
  await runMigrations();
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} signal received: closing HTTP server...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await pool.end();
        console.log('Database pool closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during database teardown', err);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();