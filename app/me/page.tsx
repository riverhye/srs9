import { interestTags } from "@/lib/site";
import { ComingSoon } from "@/components/placeholder/ComingSoon";
import { StarRiver } from "@/components/brand/StarRiver";

export default function MeHome() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-16 pb-8 sm:pt-24">
      <h1 className="fade-up text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
        보고, 읽고,
        <br />
        <span className="relative inline-block">
          쓰는
          <span className="river-line absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
        </span>{" "}
        기록.
      </h1>

      <p className="fade-up fade-up-delay mt-7 max-w-xl text-lg leading-relaxed text-muted">
        책 · 영화 · 전시, 그리고 글. 관심사를 하나의 흐름으로 모읍니다.
      </p>

      {/* "하나의 흐름" — 히어로와 피드 사이를 별이 흐르는 강으로 나눔 */}
      <div className="mt-12">
        <StarRiver />
      </div>

      {/* 카테고리 = 태그. nav가 아니라 필터칩으로 (실제 필터링은 3b에서) */}
      <div className="fade-up fade-up-delay-2 mt-12 flex flex-wrap gap-2">
        <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg">
          전체
        </span>
        {interestTags.map((t) => (
          <span
            key={t.slug}
            className="rounded-full border border-border px-4 py-1.5 font-mono text-sm text-muted"
          >
            {t.label}
          </span>
        ))}
      </div>

      <div className="mt-10">
        <ComingSoon>글이 곧 채워집니다. (3단계 CMS에서 작성·발행)</ComingSoon>
      </div>
    </section>
  );
}
