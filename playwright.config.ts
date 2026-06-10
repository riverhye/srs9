import { defineConfig, devices } from "@playwright/test";

// e2e는 dev 서버를 대상으로 실행. 포트는 env(PORT)에서, 없으면 3001.
// 이미 떠 있으면 재사용.
const PORT = process.env.PORT ?? "3001";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `${baseURL}/stella`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
