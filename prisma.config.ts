import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma v7 config — connection strings live here, not in schema.prisma
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Direct (non-pooling) URL used by CLI tools (db push / migrate)
    url: "${process.env.POSTGRES_URL_NON_POOLING}",
  },
});
