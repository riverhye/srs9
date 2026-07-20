"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// 대시보드 삭제 버튼 — 확인 후 DELETE, 목록 갱신.
export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("이 글을 삭제할까요?")) return;
    setBusy(true);
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-danger disabled:opacity-50"
    >
      삭제
    </button>
  );
}
