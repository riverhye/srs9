"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 단일 도메인 상단 내비 — 사이드바 없음(volver.tistory 결). 로고는 홈으로.
const nav = [
  { href: "/blog", label: "Blog" },
  { href: "/guestbook", label: "Guestbook" },
];

export function RootHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          srs<span className="text-accent">9</span>
        </Link>

        <ul className="flex items-center gap-1 text-sm">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 font-mono transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
