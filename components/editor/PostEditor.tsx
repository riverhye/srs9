"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";

import { editorExtensions } from "@/lib/editor/extensions";

import { Toolbar } from "./Toolbar";

// 임시저장 draft — DB/auth 전(3c)까지 localStorage에 보관. 본문은 Tiptap JSON.
const DRAFT_KEY = "stella:draft";

type Draft = {
  title: string;
  content: JSONContent;
  savedAt: number;
};

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    // 손상된 draft는 버리고 새 글로 시작
    return null;
  }
}

// 에디터 본체. 제목 + 툴바 + 본문 조합, 입력 0.5초 후 임시저장
export function PostEditor() {
  const [title, setTitle] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  // onUpdate 클로저에서 최신 제목을 읽기 위한 ref
  const titleRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 디바운스 저장. 제목/본문 어느 쪽이 바뀌어도 draft 전체를 다시 쓴다.
  function scheduleSave(content: JSONContent) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const draft: Draft = {
        title: titleRef.current,
        content,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedAt(new Date(draft.savedAt));
    }, 500);
  }

  const editor = useEditor({
    extensions: editorExtensions,
    content: "",
    // 서버에서 즉시 렌더하지 않아 SSR 하이드레이션 미스매치 방지
    immediatelyRender: false,
    // 에디터는 클라이언트에서만 만들어지므로 여기서 draft 본문 복원
    onCreate({ editor }) {
      const draft = readDraft();
      if (draft?.content) editor.commands.setContent(draft.content);
    },
    onUpdate({ editor }) {
      scheduleSave(editor.getJSON());
    },
  });

  // 제목은 SSR 마크업과 어긋나지 않도록 mount 후에 복원
  useEffect(() => {
    const draft = readDraft();
    if (!draft) return;
    setTitle(draft.title);
    titleRef.current = draft.title;
    setSavedAt(new Date(draft.savedAt));
  }, []);

  // 언마운트 시 대기 중인 저장 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onTitleChange = (value: string) => {
    setTitle(value);
    titleRef.current = value;
    if (editor) scheduleSave(editor.getJSON());
  };

  return (
    <div>
      <div className="flex items-baseline gap-4">
        <input
          type="text"
          aria-label="제목"
          placeholder="제목"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          // Enter는 개행 대신 본문으로 포커스 이동
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor?.commands.focus();
            }
          }}
          className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted"
        />
        {savedAt && (
          <span className="text-xs whitespace-nowrap text-muted">
            임시저장{" "}
            {savedAt.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <div className="mt-6">
        <Toolbar editor={editor} />
      </div>
      <EditorContent
        editor={editor}
        className="prose-stella mt-4 min-h-[60vh] outline-none"
      />
    </div>
  );
}
