import { NextResponse } from "next/server";

import { createSession, ownerPassword } from "@/lib/auth/session";

// 소유자 로그인 — 비밀번호 일치 시 세션 쿠키 발급.
export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  const expected = ownerPassword();
  if (!expected) {
    return NextResponse.json(
      { error: "서버에 비밀번호가 설정되지 않았습니다" },
      { status: 500 },
    );
  }
  if (password !== expected) {
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않습니다" },
      { status: 401 },
    );
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
