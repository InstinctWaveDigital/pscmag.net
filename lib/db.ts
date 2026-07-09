/**
 * Database module for Africa Procurement & Supply Chain Magazine.
 * Exports a single shared pg connection Pool, a compatibility raw query wrapper,
 * and the Prisma Client singleton configured with the pg adapter.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Check that .env.local exists in the project root " +
    "(same folder as package.json) and that the dev server was started from that directory."
  );
}

// ─── Shared Database Connection Pool ──────────────────────────────────────────
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: true },
  max: 2, // Low pool size to prevent EMAXCONNSESSION with serverless & Next.js build workers
});

// ─── Legacy compatibility query function ─────────────────────────────────────
export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

// ─── Prisma Client Singleton (with pg adapter) ────────────────────────────────
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;