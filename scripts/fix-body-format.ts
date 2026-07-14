import "dotenv/config";
import { query } from "../lib/db";
import fs from "fs";
import path from "path";

async function main() {
  const file = process.argv[2] || "data/articles-batch-1.json";
  const filePath = path.resolve(process.cwd(), file);
  const articles = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const TRADE_POLICY_FIX: Record<string, string> = {
    "TRADE POLICY": "policy",
  };

  for (const a of articles) {
    const paragraphs = a.body
      .split(/\n\n+/)
      .map((p: string) => p.trim())
      .filter(Boolean);

    const correctedArt = TRADE_POLICY_FIX[a.category] || a.art;

    await query(
      "UPDATE articles SET body = $1, art = $2 WHERE id = $3",
      [JSON.stringify(paragraphs), correctedArt, a.id]
    );
    console.log(`Fixed: ${a.id} (${paragraphs.length} paragraphs, art: ${correctedArt})`);
  }

  console.log("✅ Body format + art corrected for all articles in batch.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Fix failed:", err);
  process.exit(1);
});