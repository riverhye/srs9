import { NextResponse, type NextRequest } from "next/server";

// 호스트네임 → 서브도메인 트리 라우팅.
//   dev.srs9.com/*  → 내부 /dev/*   (브라우저 URL은 그대로)
//   me.srs9.com/*   → 내부 /me/*
//   srs9.com/*      → dev 서브도메인으로 리다이렉트 (루트=프로)
// 로컬: dev.localhost:3400 / me.localhost:3400

function subdomainOf(host: string): "dev" | "me" | null {
  const h = host.split(":")[0];
  if (h === "dev" || h.startsWith("dev.")) return "dev";
  if (h === "me" || h.startsWith("me.")) return "me";
  return null;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const sub = subdomainOf(host);
  const url = req.nextUrl;

  // /stella(작성 페이지)는 dev/me 공용 → 호스트 라우팅 우회, 그대로 서빙
  if (url.pathname === "/stella" || url.pathname.startsWith("/stella/")) {
    return NextResponse.next();
  }

  // apex(서브도메인 없음) → dev로 리다이렉트
  if (!sub) {
    const [bare, port] = host.split(":");
    const isLocal = bare === "localhost" || bare === "127.0.0.1";
    const target = isLocal
      ? `http://dev.localhost${port ? ":" + port : ""}`
      : "https://dev.srs9.com";
    return NextResponse.redirect(`${target}${url.pathname}${url.search}`);
  }

  // 이미 접두가 붙어있으면 그대로
  if (url.pathname === `/${sub}` || url.pathname.startsWith(`/${sub}/`)) {
    return NextResponse.next();
  }

  const rewritten = url.clone();
  rewritten.pathname = `/${sub}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(rewritten);
}

export const config = {
  // _next, 정적 파일(점 포함), api 제외
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
