import type { JSONContent } from "@tiptap/core";
import type { CSSProperties, ReactNode } from "react";

// Tiptap JSON(doc) → 읽기용 React. 서버 컴포넌트라 클라 JS 0, SEO 유리.
// 우리가 통제하는 고정 스키마(lib/editor/extensions)에 맞춘 재귀 렌더러 —
// globals.css의 .prose-stella가 기대하는 태그를 그대로 낸다.
// ponytail: 익스텐션에 노드/마크를 추가하면 이 switch도 같이 늘려야 한다(천장).
//           스키마가 더 커지면 @tiptap/static-renderer 도입 검토.
export function PostBody({ content }: { content: JSONContent }) {
  return <div className="prose-stella">{renderNodes(content.content)}</div>;
}

function renderNodes(nodes: JSONContent[] | undefined): ReactNode {
  return nodes?.map((node, i) => <RenderNode key={i} node={node} />);
}

function RenderNode({ node }: { node: JSONContent }): ReactNode {
  switch (node.type) {
    case "text":
      return applyMarks(node.text ?? "", node.marks);
    case "paragraph":
      return <p>{renderNodes(node.content)}</p>;
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 1), 1), 4);
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
      return <Tag>{renderNodes(node.content)}</Tag>;
    }
    case "blockquote":
      return <blockquote>{renderNodes(node.content)}</blockquote>;
    case "callout":
      return <aside data-callout="">{renderNodes(node.content)}</aside>;
    case "codeBlock":
      return (
        <pre>
          <code>{renderNodes(node.content)}</code>
        </pre>
      );
    case "bulletList":
      return <ul>{renderNodes(node.content)}</ul>;
    case "orderedList":
      return <ol>{renderNodes(node.content)}</ol>;
    case "listItem":
      return <li>{renderNodes(node.content)}</li>;
    case "image":
      // 본문 이미지는 임의 외부 URL(R2 업로드는 3c) — next/image 대신 <img>
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String(node.attrs?.src ?? "")}
          alt={String(node.attrs?.alt ?? "")}
        />
      );
    // 표 — 좁은 화면에서 넘칠 수 있어 스크롤 컨테이너로 감싼다(스타일은 globals.css).
    case "table":
      return (
        <div data-table-scroll="">
          <table>
            <tbody>{renderNodes(node.content)}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr>{renderNodes(node.content)}</tr>;
    case "tableHeader":
    case "tableCell": {
      const Cell = node.type === "tableHeader" ? "th" : "td";
      return (
        <Cell
          colSpan={spanOf(node, "colspan")}
          rowSpan={spanOf(node, "rowspan")}
        >
          {renderNodes(node.content)}
        </Cell>
      );
    }
    case "horizontalRule":
      return <hr />;
    case "hardBreak":
      return <br />;
    default:
      return null;
  }
}

// 셀 병합 값. 1이면 속성을 내지 않는다(기본값이라 불필요한 마크업 방지).
function spanOf(
  node: JSONContent,
  key: "colspan" | "rowspan",
): number | undefined {
  const n = Number(node.attrs?.[key]);
  return Number.isInteger(n) && n > 1 ? n : undefined;
}

type Mark = { type: string; attrs?: Record<string, unknown> };

// 텍스트에 마크를 바깥→안으로 감싼다.
function applyMarks(text: string, marks: JSONContent["marks"]): ReactNode {
  if (!marks?.length) return text;
  return (marks as Mark[]).reduce<ReactNode>(
    (child, mark) => wrapMark(mark, child),
    text,
  );
}

function wrapMark(mark: Mark, child: ReactNode): ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong>{child}</strong>;
    case "italic":
      return <em>{child}</em>;
    case "underline":
      return <u>{child}</u>;
    case "strike":
      return <s>{child}</s>;
    case "code":
      return <code>{child}</code>;
    case "highlight":
      return <mark>{child}</mark>;
    case "textStyle": {
      const color = mark.attrs?.color as string | undefined;
      return color ? (
        <span style={{ color } as CSSProperties}>{child}</span>
      ) : (
        <>{child}</>
      );
    }
    case "link": {
      const href = (mark.attrs?.href as string | undefined) ?? "#";
      const target = mark.attrs?.target as string | undefined;
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {child}
        </a>
      );
    }
    default:
      return <>{child}</>;
  }
}
