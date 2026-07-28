import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import { isOwner } from "@/lib/auth/session";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// 이미지 업로드 → R2. 소유자 전용. 반환 URL은 /api/media/<key>.
export async function POST(req: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "이미지 파일만 가능합니다" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "5MB 이하만 가능합니다" },
      { status: 413 },
    );
  }

  const ext = (file.type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "");
  const key = `${crypto.randomUUID()}.${ext}`;

  const { env } = getCloudflareContext();
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({ url: `/api/media/${key}` }, { status: 201 });
}
