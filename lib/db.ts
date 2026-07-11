import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const rawConnectionString = process.env.POSTGRES_PRISMA_URL;

if (!rawConnectionString) {
  throw new Error(
    "POSTGRES_PRISMA_URL is not set. Check Vercel Environment Variables."
  );
}

// Strip sslmode from the URL — it conflicts with the explicit ssl config below.
// The ssl object is now the single source of truth for TLS behavior.
const url = new URL(rawConnectionString);
url.searchParams.delete("sslmode");
const connectionString = url.toString();

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

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