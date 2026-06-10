import type { Metadata } from "next";

import { PostEditor } from "@/components/editor/PostEditor";

export const metadata: Metadata = {
  title: "글쓰기",
};

export default function StellaWritePage() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <PostEditor />
    </section>
  );
}
