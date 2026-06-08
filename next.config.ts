import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

// 상위 경로의 lockfile(~/package-lock.json) 때문에 Turbopack이 워크스페이스
// 루트를 잘못 추론하는 문제 방지 — 이 프로젝트 폴더를 루트로 고정.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
