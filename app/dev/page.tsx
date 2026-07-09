import { ComingSoon } from "@/components/placeholder/ComingSoon";
import { StarRiver } from "@/components/brand/StarRiver";

export default function DevHome() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      {/* Hero — 별이 흐르는 강 시그니처 */}
      <section className="pt-16 pb-16 sm:pt-24">
        <h1 className="fade-up text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
          프론트엔드 개발자에서
          <br />
          <span className="relative inline-block">
            풀스택
            <span className="river-line absolute -bottom-1 left-0 h-0.5 w-full rounded-full" />
          </span>
          으로 가는 중.
        </h1>
        {/* 드래프트 카피 — Claire 확정 카피로 교체 예정 */}
        <p className="fade-up fade-up-delay mt-7 max-w-xl text-lg leading-relaxed text-muted">
          화면에서 시작해 서버와 데이터까지, 만드는 범위를 넓혀가는 과정을
          기록합니다.
        </p>
        <div className="mt-14">
          <StarRiver />
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="scroll-mt-20 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Experience</h2>
        <div className="mt-6">
          <ComingSoon>공사중</ComingSoon>
        </div>
      </section>

      {/* Projects — 첫 화면에서 스크롤로 나열 (2단계에서 채움) */}
      <section id="projects" className="scroll-mt-20 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        <div className="mt-6">
          <ComingSoon>공사중</ComingSoon>
        </div>
      </section>
    </div>
  );
}
