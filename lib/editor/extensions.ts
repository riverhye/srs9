import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";

// 에디터(쓰기) / 렌더(읽기)에서 공유하는 확장 목록.
// 본문은 Tiptap JSON으로 저장하므로, 같은 확장 집합으로 직렬화/복원해야 한다.
// StarterKit v3에는 Bold·Italic·Underline·Strike·Code·Link·Heading·
// Blockquote·CodeBlock·List 등과 input rules(`**`, `# `)·키 단축키가 포함된다.
export const editorExtensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "내용을 입력하세요…",
  }),
];
