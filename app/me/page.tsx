import { interestTags } from "@/lib/site";
import { ComingSoon } from "@/components/placeholder/ComingSoon";

export default function MeHome() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-8 sm:pt-32">
      <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
        보고, 읽고,
        <br />
        <span className="relative inline-block">
          쓰는
          <span className="river-line absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
        </span>{" "}
        기록.
      </h1>

      <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
        책 · 영화 · 전시, 그리고 글. 관심사를 하나의 흐름으로 모읍니다.
      </p>

      {/* 카테고리 = 태그. nav가 아니라 필터칩으로 */}
      <div className="mt-10 flex flex-wrap gap-2">
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
