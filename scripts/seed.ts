import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import crypto from "crypto";
import { ARTICLES } from "../lib/data";

// ── Prisma client (loads .env via dotenv/config above) ─────────────────────
const rawUrl = process.env.POSTGRES_PRISMA_URL;
if (!rawUrl) {
  throw new Error(
    "POSTGRES_PRISMA_URL is not set. Check that .env exists in the project root and contains this variable."
  );
}

// Strip sslmode from the query string — same fix applied at runtime in the
// Next.js app — and let the Pool's `ssl` option handle TLS instead.
const connectionString = rawUrl
  .replace(/([?&])sslmode=[^&]+&?/, "$1")
  .replace(/[?&]$/, "");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Password hashing (mirrors lib/auth.ts hashPassword) ───────────────────
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// ── Default users ──────────────────────────────────────────────────────────
const DEFAULT_USERS = [
  { username: "admin", name: "Administrator", role: "admin" },
  { username: "editor", name: "Editorial Editor", role: "editor" },
  { username: "writer", name: "Staff Writer", role: "writer" },
] as const;

const DEFAULT_PASSWORD = "admin123";

async function seedUsers() {
  console.log("👤  Seeding users…");
  for (const u of DEFAULT_USERS) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {}, // don't overwrite if already exists
      create: {
        id: crypto.randomUUID(),
        username: u.username,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        name: u.name,
        role: u.role,
      },
    });
    console.log(`    ✓ ${u.username} (${u.role})`);
  }
}

// ── Articles ───────────────────────────────────────────────────────────────
async function seedArticles() {
  console.log("📰  Seeding articles…");
  for (const art of ARTICLES) {
    await prisma.article.upsert({
      where: { id: art.id },
      update: {}, // don't overwrite manually edited articles
      create: {
        id: art.id,
        category: art.category,
        art: art.art,
        title: art.title,
        excerpt: art.excerpt,
        author: art.author,
        role: art.role,
        date: art.date,
        readTime: art.readTime,
        dateline: art.dateline,
        featured: art.featured ? 1 : 0,
        tags: art.tags.join(","),
        body: JSON.stringify(art.body),
        status: "published",
        updatedAt: art.date,
      },
    });
    console.log(`    ✓ ${art.id}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱  Starting seed…\n");
  await seedUsers();
  await seedArticles();
  console.log("\n✅  Seed complete.\n");
  console.log("─────────────────────────────────────────────────");
  console.log("  Default login credentials:");
  console.log("    username: admin    password: admin123  (role: admin)");
  console.log("    username: editor   password: admin123  (role: editor)");
  console.log("    username: writer   password: admin123  (role: writer)");
  console.log(
    "  ⚠️  Change these passwords immediately via /admin/users\n"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
