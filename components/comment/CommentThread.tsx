"use client";

import { useState } from "react";

import type { PublicComment } from "@/lib/comments";

import { CommentForm } from "./CommentForm";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 댓글 트리(최상위 + 1단계 답글). 서버가 넘긴 initialComments로 SSR,
// 작성/삭제 후엔 API를 다시 읽어 갱신한다.
export function CommentThread({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: PublicComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) setComments((await res.json()) as PublicComment[]);
    setReplyTo(null);
  }

  async function remove(id: string) {
    const password = prompt("댓글 비밀번호를 입력하세요");
    if (!password) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) await refresh();
    else alert("비밀번호가 일치하지 않습니다");
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  return (
    <div>
      <CommentForm postId={postId} onDone={refresh} />

      <ul className="mt-8 space-y-6">
        {topLevel.map((c) => (
          <li key={c.id}>
            <CommentBody
              comment={c}
              onReply={() => setReplyTo(c.id)}
              onDelete={() => remove(c.id)}
            />
            {replyTo === c.id && (
              <div className="mt-3 border-l-2 border-border pl-4">
                <CommentForm postId={postId} parentId={c.id} onDone={refresh} />
              </div>
            )}
            {repliesOf(c.id).length > 0 && (
              <ul className="mt-4 space-y-4 border-l-2 border-border pl-4">
                {repliesOf(c.id).map((r) => (
                  <li key={r.id}>
                    <CommentBody comment={r} onDelete={() => remove(r.id)} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommentBody({
  comment,
  onReply,
  onDelete,
}: {
  comment: PublicComment;
  onReply?: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{comment.nickname}</span>
        <span className="text-xs text-muted">
          {formatWhen(comment.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
      <div className="mt-1 flex gap-3 text-xs text-muted">
        {onReply && (
          <button
            type="button"
            onClick={onReply}
            className="transition-colors hover:text-foreground"
          >
            답글
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="transition-colors hover:text-danger"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
