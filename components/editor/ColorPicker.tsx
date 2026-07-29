"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

// 본문 글자색 팔레트. UI 테마 토큰이 아니라 콘텐츠에 저장되는 값이라 hex를 쓴다
// (Tiptap JSON에 style="color: …"로 직렬화되어 읽기 사이드에서 그대로 렌더).
const PALETTE = [
  { label: "빨강", value: "#ef4444" },
  { label: "주황", value: "#f97316" },
  { label: "초록", value: "#22c55e" },
  { label: "파랑", value: "#3b82f6" },
  { label: "보라", value: "#8b5cf6" },
] as const;

export function ColorPicker({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 현재 선택 영역의 글자색 — 트리거의 밑줄과 팔레트 active 표시에 사용
  const current = useEditorState({
    editor,
    selector: ({ editor }) =>
      (editor?.getAttributes("textStyle").color as string | undefined) ?? null,
  });

  // 패널 밖을 누르면 닫기
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!editor) return null;

  const apply = (value: string | null) => {
    const chain = editor.chain().focus();
    (value ? chain.setColor(value) : chain.unsetColor()).run();
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="글자색"
        aria-expanded={open}
        // mousedown 시 에디터가 포커스/선택을 잃지 않도록 기본 동작 차단.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-foreground transition-colors hover:bg-surface"
      >
        <span
          className="border-b-2 px-0.5 font-semibold"
          style={{ borderColor: current ?? "var(--muted)" }}
        >
          A
        </span>
      </button>

      {open && (
        <div className="absolute top-9 left-0 z-20 flex items-center gap-1 rounded-lg border border-border bg-background p-2 shadow-sm">
          {PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={`글자색 ${c.label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(c.value)}
              className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                current === c.value ? "border-foreground" : "border-border"
              }`}
              style={{ background: c.value }}
            />
          ))}
          <button
            type="button"
            aria-label="글자색 기본"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply(null)}
            className="ml-1 h-6 rounded-md px-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            기본
          </button>
        </div>
      )}
    </div>
  );
}
