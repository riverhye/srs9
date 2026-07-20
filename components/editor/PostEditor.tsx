"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";

import { editorExtensions } from "@/lib/editor/extensions";

import { Toolbar } from "./Toolbar";

// 새 글 작성 중 크래시 대비 localStorage 자동저장(새 글에서만). DB가 소스.
const DRAFT_KEY = "stella:draft";

type InitialPost = {
  id: string;
  title: string;
  body: JSONContent;
  tags: string[];
  status: "draft" | "published";
};

type Draft = { title: string; content: JSONContent; savedAt: number };

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

// 제목 + 태그 + 툴바 + 본문. 저장(현재 상태) / 발행 버튼으로 D1에 반영.
export function PostEditor({ initialPost }: { initialPost?: InitialPost }) {
  const router = useRouter();
  const editing = !!initialPost;

  const [postId, setPostId] = useState<string | null>(initialPost?.id ?? null);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [tags, setTags] = useState((initialPost?.tags ?? []).join(", "));
  const [status, setStatus] = useState<"draft" | "published">(
    initialPost?.status ?? "draft",
  );
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef(initialPost?.title ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 새 글에서만 localStorage 자동저장(편집 모드는 DB가 소스라 건드리지 않음)
  function scheduleAutosave(content: JSONContent) {
    if (editing) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const draft: Draft = {
        title: titleRef.current,
        content,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setAutoSavedAt(new Date(draft.savedAt));
    }, 500);
  }

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialPost?.body ?? "",
    immediatelyRender: false,
    onCreate({ editor }) {
      // 새 글이면 localStorage draft 본문 복원(편집 모드는 initialPost가 이미 채움)
      if (!initialPost) {
        const draft = readDraft();
        if (draft?.content) editor.commands.setContent(draft.content);
      }
    },
    onUpdate({ editor }) {
      scheduleAutosave(editor.getJSON());
    },
  });

  // 제목은 SSR 마크업과 어긋나지 않도록 mount 후 복원(새 글만)
  useEffect(() => {
    if (initialPost) return;
    const draft = readDraft();
    if (!draft) return;
    setTitle(draft.title);
    titleRef.current = draft.title;
    setAutoSavedAt(new Date(draft.savedAt));
  }, [initialPost]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onTitleChange = (value: string) => {
    setTitle(value);
    titleRef.current = value;
    if (editor) scheduleAutosave(editor.getJSON());
  };

  // 저장: nextStatus(발행이면 published, 아니면 현재 상태 유지).
  async function save(nextStatus: "draft" | "published") {
    if (!editor || saving) return;
    setSaving(true);
    setError(null);
    const payload = {
      title: titleRef.current,
      body: editor.getJSON(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: nextStatus,
    };
    try {
      const res = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
        method: postId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "저장에 실패했습니다");
      }
      const saved = (await res.json()) as { id: string; slug: string };
      setPostId(saved.id);
      setStatus(nextStatus);
      localStorage.removeItem(DRAFT_KEY);
      if (nextStatus === "published") {
        router.push(`/blog/${saved.slug}`);
      } else {
        setAutoSavedAt(new Date());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-baseline gap-4">
        <input
          type="text"
          aria-label="제목"
          placeholder="제목"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor?.commands.focus();
            }
          }}
          className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted"
        />
        {autoSavedAt && !editing && (
          <span className="text-xs whitespace-nowrap text-muted">
            임시저장{" "}
            {autoSavedAt.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <input
        type="text"
        aria-label="태그"
        placeholder="태그 (쉼표로 구분)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="mt-3 w-full bg-transparent font-mono text-sm text-muted outline-none placeholder:text-muted"
      />

      <div className="mt-4 flex items-center gap-2 border-y border-border py-2">
        <button
          type="button"
          onClick={() => save(status)}
          disabled={saving}
          className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => save("published")}
          disabled={saving}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          발행
        </button>
        {status === "published" && (
          <span className="font-mono text-xs text-accent">발행됨</span>
        )}
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>

      <div className="mt-4">
        <Toolbar editor={editor} />
      </div>
      <EditorContent
        editor={editor}
        className="prose-stella mt-4 min-h-[60vh] outline-none"
      />
    </div>
  );
}
