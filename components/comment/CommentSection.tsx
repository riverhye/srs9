import { listComments } from "@/lib/comments";

import { CommentThread } from "./CommentThread";

// 상세 페이지 하단 댓글 영역(서버). 초기 댓글을 읽어 CommentThread에 넘긴다.
export async function CommentSection({ postId }: { postId: string }) {
  const comments = await listComments(postId);
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold">댓글 {comments.length}</h2>
      <CommentThread postId={postId} initialComments={comments} />
    </section>
  );
}
