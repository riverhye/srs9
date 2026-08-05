import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://srs9.com";

// 관리 화면과 서버 창구는 색인에서 뺀다 — 로그인 없이는 못 들어가지만
// 주소가 검색 결과에 노출될 이유도 없다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/stella", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
