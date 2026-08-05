"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { useRef, useState } from "react";

import { ColorPicker } from "./ColorPicker";

// 상단 고정 툴바. StarterKit v3 포함 명령(bold·italic·underline·strike·
// code·heading·blockquote·link)에 형광펜(Highlight)·글자색(ColorPicker)을
// 더해 노출한다. input rules(`**`, `==`, `# `)·단축키(`Cmd+B`)와 함께 동작한다.

type ToolbarProps = {
  editor: Editor | null;
};

const HEADING_LEVELS = [1, 2, 3, 4] as const;

// 고른 파일의 원본 픽셀 크기. 못 읽으면 크기 없이 넣는다(삽입 자체는 막지 않는다).
function readImageSize(
  file: File,
): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    const done = (v: { width?: number; height?: number }) => {
      URL.revokeObjectURL(objectUrl);
      resolve(v);
    };
    img.onload = () =>
      done({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => done({});
    img.src = objectUrl;
  });
}

export function Toolbar({ editor }: ToolbarProps) {
  // 이미지 파일 업로드용 숨은 input
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // v3에서 useEditor는 트랜잭션마다 리렌더하지 않으므로, active 상태는
  // useEditorState로 구독해 버튼 강조가 실시간 반영되게 한다.
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: !!editor?.isActive("bold"),
      italic: !!editor?.isActive("italic"),
      underline: !!editor?.isActive("underline"),
      strike: !!editor?.isActive("strike"),
      code: !!editor?.isActive("code"),
      highlight: !!editor?.isActive("highlight"),
      blockquote: !!editor?.isActive("blockquote"),
      callout: !!editor?.isActive("callout"),
      link: !!editor?.isActive("link"),
      headings: HEADING_LEVELS.map(
        (level) => !!editor?.isActive("heading", { level }),
      ),
    }),
  });

  if (!editor || !active) return null;

  // 선택 영역에 링크를 토글한다. 이미 링크면 해제, 아니면 URL을 입력받아 설정.
  const toggleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("링크 URL");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  // 파일을 R2에 업로드하고 받은 URL로 본문에 이미지를 삽입한다.
  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 가능하게 초기화
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        alert(j.error ?? "업로드에 실패했습니다");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      // 크기를 함께 넣는다 — 없으면 읽기 화면에서 이미지가 로드될 때 본문이 밀린다(CLS).
      const dims = await readImageSize(file);
      editor
        .chain()
        .focus()
        .setImage({ src: url, ...dims })
        .run();
    } catch {
      alert("업로드에 실패했습니다");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="서식 도구"
      className="sticky top-16 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-background/80 py-2 backdrop-blur"
    >
      <ToolbarButton
        label="굵게"
        isActive={active.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="기울임"
        isActive={active.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="밑줄"
        isActive={active.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        label="취소선"
        isActive={active.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        label="코드"
        isActive={active.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <span className="font-mono">{"<>"}</span>
      </ToolbarButton>
      <ToolbarButton
        label="형광펜"
        isActive={active.highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        🖍
      </ToolbarButton>
      <ColorPicker editor={editor} />

      <ToolbarDivider />

      {HEADING_LEVELS.map((level, i) => (
        <ToolbarButton
          key={level}
          label={`제목 ${level}`}
          isActive={active.headings[i]}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          H{level}
        </ToolbarButton>
      ))}

      <ToolbarDivider />

      <ToolbarButton
        label="인용"
        isActive={active.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;&rdquo;
      </ToolbarButton>
      <ToolbarButton
        label="콜아웃"
        isActive={active.callout}
        onClick={() => editor.chain().focus().toggleCallout().run()}
      >
        ✦
      </ToolbarButton>
      <ToolbarButton label="링크" isActive={active.link} onClick={toggleLink}>
        🔗
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="이미지"
        isActive={uploading}
        onClick={() => fileRef.current?.click()}
      >
        🖼
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPickImage}
      />
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({
  label,
  isActive,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      // mousedown 시 에디터가 포커스/선택을 잃지 않도록 기본 동작 차단.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors hover:bg-surface ${
        isActive ? "bg-accent text-accent-fg" : "text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}
