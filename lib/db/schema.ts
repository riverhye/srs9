import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// 포스트. 단일 사이트라 scope 필드는 없다.
// body는 Tiptap JSON을 문자열로 저장(SQLite엔 JSON 타입 없음), tags도 JSON 배열 문자열.
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(), // uuid
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  body: text("body").notNull(), // JSON.stringify(Tiptap doc)
  tags: text("tags").notNull().default("[]"), // JSON string[]
  date: text("date").notNull(), // ISO (YYYY-MM-DD)
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// 댓글 — 익명(닉네임+비밀번호). parentId가 있으면 대댓글(1단계).
// FK 제약은 걸지 않고(로컬 D1 FK 미강제) 앱에서 정리한다(deletePost/삭제 시).
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  parentId: text("parent_id"), // null이면 최상위 댓글
  nickname: text("nickname").notNull(),
  passwordHash: text("password_hash").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
