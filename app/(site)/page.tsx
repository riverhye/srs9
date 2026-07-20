import Link from "next/link";
import { StarRiver } from "@/components/brand/StarRiver";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 sm:pt-32">
      <h1 className="fade-up text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
          Ne te quaesiveris extra
      </h1>
      <p className="fade-up fade-up-delay mt-4 max-w-xl text-lg leading-relaxed text-muted">
        읽고 보고 만들며 그 사이의 생각을 남깁니다.
      </p>

      <div className="fade-up fade-up-delay-2 mt-10">
        <Link
          href="/blog"
          className="inline-block rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Blog
        </Link>
      </div>

      <div className="mt-16">
        <StarRiver />
      </div>
    </section>
  );
}
