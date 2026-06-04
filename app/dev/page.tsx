import { ComingSoon } from "@/components/placeholder/ComingSoon";

export default function DevHome() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      {/* Hero */}
      <section className="pt-24 pb-20 sm:pt-32">
        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          프론트엔드 개발자에서
          <br />
          <span className="relative inline-block">
            풀스택
            <span className="river-line absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
          </span>
          으로 가는 중.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
          소개글
        </p>
      </section>

      {/* Experience */}
      <section id="experience" className="scroll-mt-20py-16">
        <h2 className="font-mono text-sm font-semibold tracking-widest text-muted uppercase">
          Experience
        </h2>
        <div className="mt-6">
          <ComingSoon>공사중</ComingSoon>
        </div>
      </section>

      {/* Projects — 첫 화면에서 스크롤로 나열 (2단계에서 채움) */}
      <section id="projects" className="scroll-mt-20py-16">
        <h2 className="font-mono text-sm font-semibold tracking-widest text-muted uppercase">
          Projects
        </h2>
        <div className="mt-6">
          <ComingSoon>공사중</ComingSoon>
        </div>
      </section>
    </div>
  );
}
