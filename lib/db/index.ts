import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

// D1 바인딩(env.DB)으로 Drizzle 클라이언트 생성.
// 요청 처리 중(라우트 핸들러·동적 서버 컴포넌트)에서 사용.
export function getDb() {
  return drizzle(getCloudflareContext().env.DB, { schema });
}

// SSG/프리렌더 경로용 async 변형.
export async function getDbAsync() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}
