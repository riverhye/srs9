import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Next.js → Cloudflare Workers 빌드 설정.
// 증분 캐시(R2)는 넣지 않았다 — 글 목록·상세가 매 요청 D1을 읽는 동적 페이지라
// 캐시가 오히려 새 글 반영을 늦춘다. 정적 페이지가 늘면 그때 붙인다.
export default defineCloudflareConfig();
