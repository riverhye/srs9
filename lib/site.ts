// 사이트 전역 설정. 두 서브도메인이 한 코드베이스를 공유한다.
//  - dev.srs9.com : 이력서·포폴 중심
//  - me.srs9.com  : 사적인 관심사 중심
// 개인정보는 .env.local에서 주입

export const brand = {
  name: "srs9",
  fullName: "Stella River Spencer",
} as const;

export type SiteKey = "dev" | "me";

export const sites = {
  dev: {
    key: "dev",
    title: "srs9 · dev",
    description: "개발 이력",
    // 원페이지 스크롤. nav는 같은 페이지 섹션으로 점프하는 앵커.
    nav: [
      { href: "#experience", label: "Experience" },
      { href: "#projects", label: "Projects" },
    ],
    other: "me",
  },
  me: {
    key: "me",
    title: "srs9 · me",
    description: "사적인 관심사",
    nav: [],
    other: "dev",
  },
} as const satisfies Record<SiteKey, unknown>;

// me 사이트의 관심사 태그
export const interestTags = [
  { slug: "essay", label: "essay" },
  { slug: "book", label: "book" },
  { slug: "movie", label: "movie" },
  { slug: "exhibition", label: "exhibition" },
] as const;

// 비어 있으면 푸터에서 자동으로 숨김
export const social = {
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
};
