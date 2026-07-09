"use client";

import { useEditorState, type Editor } from "@tiptap/react";

// 상단 고정 툴바. StarterKit v3에 이미 포함된 명령(bold·italic·underline·
// strike·code·heading·blockquote·link)을 버튼으로 노출한다. 새 익스텐션은
// 추가하지 않고, input rules(`**`, `# `)·단축키(`Cmd+B`)와 함께 동작한다.

type ToolbarProps = {
  editor: Editor | null;
};

const HEADING_LEVELS = [1, 2, 3, 4] as const;

export function Toolbar({ editor }: ToolbarProps) {
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

  // 이미지 URL을 입력받아 본문에 삽입한다. 업로드(R2)는 3c에서.
  const insertImage = () => {
    const src = window.prompt("이미지 URL");
    if (!src) return;
    editor.chain().focus().setImage({ src }).run();
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

      <ToolbarButton label="이미지" isActive={false} onClick={insertImage}>
        🖼
      </ToolbarButton>
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
