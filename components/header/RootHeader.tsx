"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sites, type SiteKey } from "@/lib/site";
import { SubdomainLink } from "@/components/link/SubdomainLink";

export function RootHeader({ site }: { site: SiteKey }) {
  const pathname = usePathname();
  const conf = sites[site];
  // middleware rewrite로 내부 경로에 /dev|/me 접두가 붙을 수 있어 제거 후 비교
  const current = pathname.replace(/^\/(dev|me)(?=\/|$)/, "") || "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          srs<span className="text-accent">9</span>
        </Link>

        <ul className="flex items-center gap-1 text-sm">
          {conf.nav.map((item) => {
            // 해시(#)는 같은 페이지 섹션으로 스크롤 — 일반 앵커로 렌더
            if (item.href.startsWith("#")) {
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-md px-3 py-2 text-muted transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              );
            }
            const active =
              current === item.href || current.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 transition-colors ${
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
          <li>
            <SubdomainLink
              to={conf.other}
              className="rounded-md px-3 py-2 font-mono text-muted transition-colors hover:text-foreground"
            >
              {conf.other} ↗
            </SubdomainLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
