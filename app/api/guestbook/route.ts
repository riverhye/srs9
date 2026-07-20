import { NextResponse } from "next/server";

import { createEntry, listEntries } from "@/lib/guestbook";

export async function GET() {
  return NextResponse.json(await listEntries());
}

// 방문자 익명 방명록 작성.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as {
    nickname?: string;
    password?: string;
    body?: string;
  };
  if (!b.nickname?.trim() || !b.password || !b.body?.trim()) {
    return NextResponse.json(
      { error: "닉네임·비밀번호·내용을 입력하세요" },
      { status: 400 },
    );
  }
  const entry = await createEntry({
    nickname: b.nickname.trim(),
    password: b.password,
    body: b.body.trim(),
  });
  return NextResponse.json(entry, { status: 201 });
}
