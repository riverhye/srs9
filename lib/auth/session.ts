import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 단일 관리자 세션 — 고정 페이로드에 HMAC 서명(위조 방지)한 httpOnly 쿠키.
// 서명 키 = STELLA_PASSWORD(.dev.vars / 배포 시 Cloudflare secret).
const COOKIE = "stella_session";
const PAYLOAD = "owner";

function secret(): string {
  return getCloudflareContext().env.STELLA_PASSWORD ?? "";
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ownerPassword(): string {
  return secret();
}

export async function createSession(): Promise<void> {
  const sig = await sign(PAYLOAD);
  (await cookies()).set(COOKIE, `${PAYLOAD}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isOwner(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !secret()) return false;
  const [value, sig] = raw.split(".");
  return value === PAYLOAD && !!sig && (await sign(PAYLOAD)) === sig;
}

// 서버 컴포넌트/페이지 가드 — 미인증이면 로그인으로.
export async function requireOwner(): Promise<void> {
  if (!(await isOwner())) redirect("/stella/login");
}
