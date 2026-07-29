"use client";

import { useState } from "react";

import type { PublicEntry } from "@/lib/guestbook";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 방명록 — 방문자 익명 작성 + 소유자 답글/모더레이션. 서버가 넘긴 초기 목록으로 SSR.
export function GuestbookBoard({
  initialEntries,
  isOwner,
}: {
  initialEntries: PublicEntry[];
  isOwner: boolean;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/guestbook");
    if (res.ok) setEntries((await res.json()) as PublicEntry[]);
    setReplyTo(null);
  }

  async function remove(entry: PublicEntry) {
    if (isOwner) {
      if (!confirm("삭제할까요?")) return;
      const res = await fetch(`/api/guestbook/${entry.id}`, {
        method: "DELETE",
      });
      if (res.ok) await refresh();
      return;
    }
    const password = prompt("비밀번호를 입력하세요");
    if (!password) return;
    const res = await fetch(`/api/guestbook/${entry.id}`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) await refresh();
    else alert("비밀번호가 일치하지 않습니다");
  }

  const top = entries.filter((e) => !e.parentId);
  const repliesOf = (id: string) => entries.filter((e) => e.parentId === id);

  return (
    <div className="mt-8">
      <EntryForm onDone={refresh} />

      <ul className="mt-10 space-y-6">
        {top.length === 0 && (
          <li className="text-sm text-muted">첫 방명록을 남겨보세요.</li>
        )}
        {top.map((entry) => (
          <li key={entry.id} className="border-b border-border pb-6">
            <EntryBody entry={entry} onDelete={() => remove(entry)} />

            {isOwner && (
              <button
                type="button"
                onClick={() =>
                  setReplyTo(replyTo === entry.id ? null : entry.id)
                }
                className="mt-1 text-xs text-muted transition-colors hover:text-foreground"
              >
                답글
              </button>
            )}
            {replyTo === entry.id && (
              <OwnerReplyForm id={entry.id} onDone={refresh} />
            )}

            {repliesOf(entry.id).map((r) => (
              <div
                key={r.id}
                className="mt-4 rounded-md border-l-2 border-accent bg-surface px-4 py-3"
              >
                <EntryBody entry={r} onDelete={() => remove(r)} />
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EntryBody({
  entry,
  onDelete,
}: {
  entry: PublicEntry;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-medium ${entry.isOwner ? "text-accent" : ""}`}>
          {entry.nickname}
          {entry.isOwner && " ✦"}
        </span>
        <span className="text-xs text-muted">
          {formatWhen(entry.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap">{entry.body}</p>
      <button
        type="button"
        onClick={onDelete}
        className="mt-1 text-xs text-muted transition-colors hover:text-danger"
      >
        삭제
      </button>
    </div>
  );
}

function EntryForm({ onDone }: { onDone: () => void }) {
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
    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nickname, password, body }),
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
    <form onSubmit={submit}>
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
        aria-label="방명록 내용"
        placeholder="방명록을 남겨보세요"
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
          남기기
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </form>
  );
}

function OwnerReplyForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !body.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/guestbook/${id}/reply`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setBusy(false);
    if (res.ok) {
      setBody("");
      onDone();
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 border-l-2 border-border pl-4">
      <textarea
        aria-label="답글 내용"
        placeholder="답글"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="w-full resize-y rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        답글 등록
      </button>
    </form>
  );
}
