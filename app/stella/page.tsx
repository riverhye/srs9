"use client";

import { useEditor, EditorContent } from "@tiptap/react";

import { editorExtensions } from "@/lib/editor/extensions";

// Tiptap은 클라이언트 전용. 툴바 등 조합이 생기면 PostEditor로 추출 예정(Step 3).
export default function StellaPage() {
  const editor = useEditor({
    extensions: editorExtensions,
    content: "",
    // 서버에서 즉시 렌더하지 않아 SSR 하이드레이션 미스매치 방지
    immediatelyRender: false,
  });

  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-2xl font-bold tracking-tight">stella</h1>
      <p className="mt-3 text-muted">글 작성 공간.</p>

      <div className="mt-8">
        <EditorContent
          editor={editor}
          className="prose-stella min-h-[60vh] outline-none"
        />
      </div>
    </section>
  );
}
