"use client";

import { useEditor, EditorContent } from "@tiptap/react";

import { editorExtensions } from "@/lib/editor/extensions";

import { Toolbar } from "./Toolbar";

// 에디터 본체. 툴바 + 본문 조합
export function PostEditor() {
  const editor = useEditor({
    extensions: editorExtensions,
    content: "",
    // 서버에서 즉시 렌더하지 않아 SSR 하이드레이션 미스매치 방지
    immediatelyRender: false,
  });

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose-stella mt-4 min-h-[60vh] outline-none"
      />
    </div>
  );
}
