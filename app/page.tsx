import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-8 sm:pt-32">
      <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
        프론트엔드 개발자로 시작하여, 풀스택으로 확장 중이에요.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/work"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 font-mono"
        >
          WORK
        </Link>
        <Link
          href="/log"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface font-mono"
        >
          LOG
        </Link>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2">
        <Link
          href="/work"
          className="group rounded-2xl border border-border p-6 transition-colors hover:bg-surface"
        >
          <h2 className="text-base font-semibold font-mono">Work</h2>
          <p className="mt-1.5 text-sm text-muted ">project & experience</p>
          <span className="mt-4 inline-block text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
            보러 가기
          </span>
        </Link>
        <Link
          href="/log"
          className="group rounded-2xl border border-border p-6 transition-colors hover:bg-surface"
        >
          <h2 className="text-base font-semibold font-mono">Log</h2>
          <p className="mt-1.5 text-sm text-muted">블로그</p>
          <span className="mt-4 inline-block text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
            보러 가기
          </span>
        </Link>
      </div>
    </section>
  );
}
