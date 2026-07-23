/**
 * Decorative drifting ECG trace — the background of the Pulse hero card
 * (v2 effects §8). Two faint telemetry lines (ember and forest) loop seamlessly
 * using the same duplicate-half technique as the ticker; motion stops under
 * prefers-reduced-motion (the static trace stays). aria-hidden and
 * pointer-events-none throughout; absolutely positioned, so zero-CLS.
 *
 * The waveform is a stylised PQRST cycle, not clinical data.
 */

const CYCLE_W = 220;
const HALF_CYCLES = 8;
const HEIGHT = 120;
const BASE_Y = 60;

function ecgPath(): string {
  const parts: string[] = [`M 0 ${BASE_Y}`];
  for (let i = 0; i < HALF_CYCLES * 2; i++) {
    const x = i * CYCLE_W;
    parts.push(
      `L ${x + 52} ${BASE_Y}`,
      "q 8 -10 16 0",
      "l 14 0",
      "l 6 10",
      "l 10 -46",
      "l 10 52",
      "l 8 -16",
      "l 16 0",
      "q 12 -16 24 0",
      `L ${x + CYCLE_W} ${BASE_Y}`,
    );
  }
  return parts.join(" ");
}

const WIDTH = CYCLE_W * HALF_CYCLES * 2;
const PATH = ecgPath();

function EcgLine({
  className,
  stroke,
  opacity,
}: {
  className: string;
  stroke: string;
  opacity: number;
}) {
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`${className} block max-w-none`}
      fill="none"
    >
      <path
        d={PATH}
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeroEcg() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <EcgLine className="ecg-rail" stroke="var(--primary)" opacity={0.14} />
      </div>
      <div className="absolute inset-x-0 top-1/2 mt-7 -translate-y-1/2">
        <EcgLine
          className="ecg-rail ecg-rail-slow"
          stroke="var(--good)"
          opacity={0.1}
        />
      </div>
    </div>
  );
}
