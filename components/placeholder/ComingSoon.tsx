/** 아직 콘텐츠가 없는 영역에 쓰는 자리표시 박스 */
export function ComingSoon({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
      {children}
    </div>
  );
}
