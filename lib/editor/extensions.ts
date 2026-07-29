import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

import { Callout } from "./callout";

// 에디터(쓰기) / 렌더(읽기)에서 공유하는 확장 목록.
// 본문은 Tiptap JSON으로 저장하므로, 같은 확장 집합으로 직렬화/복원해야 한다.
// StarterKit v3에는 Bold·Italic·Underline·Strike·Code·Link·Heading·
// Blockquote·CodeBlock·List 등과 input rules(`**`, `# `)·키 단축키가 포함된다.
// Image는 블록 이미지(URL). 실제 업로드(R2)는 3c에서 붙이고, 지금은 URL 입력만.
// Callout은 별(✦) 모티프 커스텀 블록.
// TextStyle+Color는 글자색(인라인 style로 직렬화), Highlight는 형광펜
// (<mark>, `==텍스트==` input rule 포함 — 색은 globals.css의 --highlight 토큰).
export const editorExtensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "내용을 입력하세요…",
  }),
  Image.configure({ inline: false }),
  Callout,
  TextStyle,
  Color,
  Highlight,
];
