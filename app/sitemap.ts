import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";

// 검색엔진에 줄 주소 목록. 발행글만 넣는다(초안은 공개되지 않으므로).
// 절대 주소가 필요해서 layout의 metadataBase와 같은 기준을 쓴다.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://srs9.com";

// 발행글을 매번 읽어야 새 글이 검색엔진에 노출된다. 선언이 없으면 빌드 시점에
// 한 번 만들어져 고정되고(그때는 D1 바인딩도 없어 빌드가 실패한다).
export const dynamic = "force-dynamic";

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
