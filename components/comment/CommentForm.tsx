"use client";

import { useState } from "react";

// 익명 댓글/답글 입력 폼. parentId가 있으면 답글.
export function CommentForm({
  postId,
  parentId = null,
  onDone,
}: {
  postId: string;
  parentId?: string | null;
  onDone: () => void;
}) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nickname, password, body, parentId }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "등록에 실패했습니다");
      return;
    }
    setNickname("");
    setPassword("");
    setBody("");
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          aria-label="닉네임"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-1/2 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          type="password"
          aria-label="비밀번호"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-1/2 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <textarea
        aria-label="댓글 내용"
        placeholder="댓글을 남겨보세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="mt-2 w-full resize-y rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {parentId ? "답글 등록" : "등록"}
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </form>
  );
}
