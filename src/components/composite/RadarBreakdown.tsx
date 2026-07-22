import type { SubScoreResult } from "@/lib/composite/index-engine";

/**
 * Sub-score radar (METHODOLOGY.md §4.6 — the headline index never appears
 * without its full breakdown). Inline SVG, fixed viewBox (zero CLS), no
 * charting library. Each axis is one sub-score, 0 at centre → 100 at edge.
 */
export function RadarBreakdown({ subScores }: { subScores: SubScoreResult[] }) {
  const n = subScores.length;
  if (n < 3) return null; // a radar needs ≥3 axes

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const rMax = size / 2 - 54; // leave room for labels

  const pointAt = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  };

  const gridRings = [0.25, 0.5, 0.75, 1];
  const dataPoints = subScores
    .map((s, i) => pointAt(i, (s.score / 100) * rMax).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Sub-score breakdown radar"
      className="mx-auto h-auto w-full max-w-sm"
      data-testid="radar-breakdown"
    >
      {gridRings.map((ring) => (
        <polygon
          key={ring}
          points={subScores
            .map((_, i) => pointAt(i, ring * rMax).join(","))
            .join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {subScores.map((_, i) => {
        const [x, y] = pointAt(i, rMax);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
      <polygon
        points={dataPoints}
        fill="color-mix(in srgb, var(--primary) 25%, transparent)"
        stroke="var(--primary)"
        strokeWidth="2"
      />
      {subScores.map((s, i) => {
        const [x, y] = pointAt(i, rMax + 16);
        return (
          <text
            key={s.key}
            x={x}
            y={y}
            fontSize="10"
            fill="var(--muted)"
            textAnchor={Math.abs(x - cx) < 4 ? "middle" : x < cx ? "end" : "start"}
            dominantBaseline="middle"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}
