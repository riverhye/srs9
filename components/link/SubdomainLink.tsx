"use client";

import { useSyncExternalStore } from "react";
import type { SiteKey } from "@/lib/site";

// location은 스스로 바뀌지 않으므로 구독은 no-op.
const subscribe = () => () => {};

/**
 * 다른 서브도메인(dev ↔ me)으로 가는 링크.
 * 현재 host의 첫 라벨만 바꿔 로컬(dev.localhost)·운영(dev.srs9.com) 모두에서 동작.
 */
export function SubdomainLink({
  to,
  children,
  className,
}: {
  to: SiteKey;
  children: React.ReactNode;
  className?: string;
}) {
  // 외부 시스템(window.location)을 SSR-safe하게 읽는다.
  // 서버/하이드레이션은 fallback, 하이드레이션 직후 실제 host로 교체.
  const href = useSyncExternalStore(
    subscribe,
    () => {
      const { protocol, host } = window.location;
      const parts = host.split("."); // ["dev","localhost:3001"] 또는 ["dev","srs9","com"]
      parts[0] = to;
      return `${protocol}//${parts.join(".")}`;
    },
    () => `https://${to}.srs9.com`,
  );

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
