// 사이트 전역 설정. 단일 도메인(srs9.com) — 브랜드 + 개인정보(env) 주입.
// 개인정보는 .env.local에서 주입.

export const brand = {
  name: "srs9",
  fullName: "Stella River Spencer",
} as const;

// 비어 있으면 푸터에서 자동으로 숨김
export const social = {
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
};
