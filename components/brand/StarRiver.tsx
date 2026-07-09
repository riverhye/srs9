// 별이 흐르는 강 — 별(Stella)·흐름(River)·9 모티프를 한 장면에 담은 dev 홈 히어로 시그니처.
// 순수 CSS 애니메이션(라인 드로잉 → 별 9개 순차 등장). 장식 요소라 aria-hidden.

// 강 곡선을 따라 배치한 별 9개. 크기를 섞어 원근감을 주고, 네 번째 별이 앵커(Stella).
const STARS = [
  { x: 28, y: 44, size: 10 },
  { x: 96, y: 30, size: 13 },
  { x: 168, y: 64, size: 9 },
  { x: 240, y: 42, size: 18 },
  { x: 312, y: 30, size: 10 },
  { x: 382, y: 60, size: 12 },
  { x: 452, y: 36, size: 9 },
  { x: 540, y: 26, size: 14 },
  { x: 616, y: 38, size: 10 },
] as const;

export function StarRiver() {
  return (
    <svg viewBox="0 0 640 96" aria-hidden="true" className="w-full">
      <defs>
        {/* 양 끝이 투명하게 잦아드는 강 그라데이션 — river-line과 같은 문법 */}
        <linearGradient id="river-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="0.3" stopColor="var(--accent)" stopOpacity="1" />
          <stop offset="0.7" stopColor="var(--accent)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* pathLength=1 트릭으로 dasharray/dashoffset을 0~1 정규화해 드로잉 */}
      <path
        className="star-river-path"
        d="M 0 56 C 80 24 150 76 240 50 C 320 27 370 66 450 44 C 520 25 580 48 640 32"
        pathLength={1}
        fill="none"
        stroke="url(#river-flow)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {STARS.map((s, i) => (
        <text
          key={s.x}
          className="star-river-star"
          x={s.x}
          y={s.y}
          fontSize={s.size}
          textAnchor="middle"
          fill="var(--accent)"
          style={{ animationDelay: `${0.55 + i * 0.12}s` }}
        >
          ✦
        </text>
      ))}
    </svg>
  );
}
