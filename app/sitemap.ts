import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";

// 검색엔진에 줄 주소 목록. 발행글만 넣는다(초안은 공개되지 않으므로).
// 절대 주소가 필요해서 layout의 metadataBase와 같은 기준을 쓴다.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://srs9.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  // 글이 하나라도 있으면 목록의 최근 변경일은 가장 최신 글 기준
  const latest = posts[0]?.updatedAt;

  return [
    { url: SITE_URL, lastModified: latest, changeFrequency: "weekly" },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latest,
      changeFrequency: "weekly",
    },
    { url: `${SITE_URL}/guestbook`, changeFrequency: "weekly" },
    ...posts.map((post) => ({
      // slug에 한글·점이 들어가므로 인코딩해야 유효한 URL이 된다
      url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
