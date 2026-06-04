"use client";

import { useEffect, useState } from "react";
import type { SiteKey } from "@/lib/site";

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
  const [href, setHref] = useState(`https://${to}.srs9.com`);

  useEffect(() => {
    const { protocol, host } = window.location;
    const parts = host.split("."); // ["dev","localhost:3400"] 또는 ["dev","srs9","com"]
    parts[0] = to;
    setHref(`${protocol}//${parts.join(".")}`);
  }, [to]);

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
