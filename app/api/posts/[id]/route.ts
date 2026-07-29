import { NextResponse } from "next/server";

import { isOwner } from "@/lib/auth/session";
import { deletePost, type PostInput, updatePost } from "@/lib/posts";

import { validate } from "../route";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () =>
  NextResponse.json({ error: "unauthorized" }, { status: 401 });

// 글 수정 — 소유자 전용.
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isOwner())) return unauthorized();
  const { id } = await params;
  const input = (await req.json()) as Partial<PostInput>;
  const error = validate(input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const post = await updatePost(id, input as PostInput);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(post);
}

// 글 삭제 — 소유자 전용.
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isOwner())) return unauthorized();
  const { id } = await params;
  await deletePost(id);
  return new NextResponse(null, { status: 204 });
}
