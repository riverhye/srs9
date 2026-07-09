import { Node, mergeAttributes } from "@tiptap/core";

// 별(✦) 모티프를 단 Notion식 callout 블록.
// content: block+ — 박스 안에서 문단·리스트 등 블록을 작성할 수 있다.
// 별 마커는 편집 대상이 아니므로 CSS ::before로 그리고, 직렬화되는 HTML은
// <aside data-callout>만 남긴다(본문은 0 자리에 채워짐).
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      // 선택 블록을 callout으로 감싸거나, 이미 callout이면 해제한다.
      toggleCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "aside[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0];
  },

  addCommands() {
    return {
      toggleCallout:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },
});
