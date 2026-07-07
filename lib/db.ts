import { Pool } from "pg";
import crypto from "crypto";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/procurement_mag";

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initDb() {
  if (isInitialized) return;

  // If initialization is already in progress, await the existing promise lock
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Create Users Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'editor', 'writer'))
        );
      `);

      // 2. Create Articles Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS articles (
          id VARCHAR(255) PRIMARY KEY,
          category VARCHAR(255) NOT NULL,
          art TEXT NOT NULL,
          title TEXT NOT NULL,
          excerpt TEXT NOT NULL,
          author VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          date VARCHAR(50) NOT NULL,
          read_time VARCHAR(50) NOT NULL,
          dateline VARCHAR(100) NOT NULL,
          featured INTEGER DEFAULT 0,
          tags TEXT NOT NULL,
          body TEXT NOT NULL, 
          status VARCHAR(50) NOT NULL CHECK(status IN ('published', 'draft', 'archived')),
          updated_at VARCHAR(50) NOT NULL
        );
      `);

      // 3. Create Media Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS media (
          id VARCHAR(255) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          filepath TEXT NOT NULL,
          size INTEGER NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          created_at VARCHAR(50) NOT NULL
        );
      `);

      // Seed default users if empty
      const userCountRes = await pool.query("SELECT COUNT(*) FROM users");
      const userCount = parseInt(userCountRes.rows[0].count, 10);

      if (userCount === 0) {
        const defaultHash = crypto.createHash("sha256").update("admin123").digest("hex");

        await pool.query(
          "INSERT INTO users (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
          [crypto.randomUUID(), "admin", defaultHash, "Administrator", "admin"]
        );
        await pool.query(
          "INSERT INTO users (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
          [crypto.randomUUID(), "editor", defaultHash, "Editorial Editor", "editor"]
        );
        await pool.query(
          "INSERT INTO users (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
          [crypto.randomUUID(), "writer", defaultHash, "Staff Writer", "writer"]
        );
        console.log("💾 Default administrative seed users initialized.");
      }

      // Seed articles if empty
      const articleCountRes = await pool.query("SELECT COUNT(*) FROM articles");
      const articleCount = parseInt(articleCountRes.rows[0].count, 10);

      if (articleCount === 0) {
        const { ARTICLES } = await import("./data");
        for (const art of ARTICLES) {
          await pool.query(`
            INSERT INTO articles (
              id, category, art, title, excerpt, author, role, date, read_time, dateline, featured, tags, body, status, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            art.id,
            art.category,
            art.art,
            art.title,
            art.excerpt,
            art.author,
            art.role,
            art.date,
            art.readTime,
            art.dateline,
            art.featured ? 1 : 0,
            art.tags.join(","),
            JSON.stringify(art.body),
            "published",
            art.date,
          ]);
        }
        console.log("💾 Base magazine articles collection synchronized successfully.");
      }

      isInitialized = true;
    } catch (error: any) {
      console.error("=================================================");
      console.error("❌ THE REAL DATABASE CRASH REASON:");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("Stack:", error.stack);
      console.error("=================================================");

      initPromise = null; // Clear promise lock on error
      throw error;
    }
  })();

  return initPromise;
}

// ─── Query Wrapper ───
export async function query(text: string, params?: any[]) {
  await initDb();
  return pool.query(text, params);
}