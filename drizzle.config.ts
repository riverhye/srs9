import { defineConfig } from "drizzle-kit";

// 스키마 → SQL 마이그레이션 생성용(오프라인). 로컬 적용은
// `wrangler d1 migrations apply srs9-db --local` (package.json: db:migrate:local).
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
});
