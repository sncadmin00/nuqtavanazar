import { useEffect, useState } from "react";

type Dot = { cx: number; cy: number; r: number; fill: string; opacity: number };

// 5 dots — index preserved across states. idx2 is always orange, others cream.
// Color does not animate — only cx / cy / r / opacity.
const O = "#E8562D";
const C = "#F4F1EA";

const STATES: Dot[][] = [
  // 0 — "Circle": 5 dots on a circle radius 32 around (50,50)
  [
    { cx: 50, cy: 18, r: 4, fill: C, opacity: 1 },
    { cx: 80.4, cy: 40.1, r: 4, fill: C, opacity: 1 },
    { cx: 68.8, cy: 75.9, r: 5, fill: O, opacity: 1 },
    { cx: 31.2, cy: 75.9, r: 4, fill: C, opacity: 1 },
    { cx: 19.6, cy: 40.1, r: 4, fill: C, opacity: 1 },
  ],
  // 1 — "Line": horizontal line at y=50, orange centered
  [
    { cx: 15, cy: 50, r: 4, fill: C, opacity: 1 },
    { cx: 32.5, cy: 50, r: 4, fill: C, opacity: 1 },
    { cx: 50, cy: 50, r: 5, fill: O, opacity: 1 },
    { cx: 67.5, cy: 50, r: 4, fill: C, opacity: 1 },
    { cx: 85, cy: 50, r: 4, fill: C, opacity: 1 },
  ],
  // 2 — Final composition (as in header/favicon)
  [
    { cx: 32, cy: 34, r: 3.2, fill: C, opacity: 0.75 },
    { cx: 71, cy: 23, r: 3.0, fill: C, opacity: 0.7 },
    { cx: 50, cy: 50, r: 7, fill: O, opacity: 1 },
    { cx: 75, cy: 64, r: 4.3, fill: C, opacity: 1 },
    { cx: 26, cy: 71, r: 4.6, fill: C, opacity: 1 },
  ],
];

const EASE = "cubic-bezier(.65,0,.35,1)";
const DUR = 900;

export type AnimatedLogoProps = {
  size?: number;
  /** loop: continuously cycles 0→1→2→0; pulse: cycles 1↔2; reveal: 0→1→2 once */
  mode?: "loop" | "pulse" | "reveal";
  /** background circle for splash contexts */
  background?: string;
  className?: string;
  /** trigger key — changing it restarts a "reveal" or "pulse" run */
  trigger?: string | number;
};

export function AnimatedLogo({
  size = 96,
  mode = "reveal",
  background,
  className,
  trigger,
}: AnimatedLogoProps) {
  const [idx, setIdx] = useState(mode === "pulse" ? 1 : 0);

  useEffect(() => {
    if (mode === "reveal") {
      setIdx(0);
      const t1 = setTimeout(() => setIdx(1), 50);
      const t2 = setTimeout(() => setIdx(2), 50 + DUR);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (mode === "pulse") {
      setIdx(1);
      const t = setTimeout(() => setIdx(2), 50);
      return () => clearTimeout(t);
    }
    // loop
    setIdx(0);
    let step = 0;
    const id = setInterval(() => {
      step = (step + 1) % STATES.length;
      setIdx(step);
    }, DUR + 250);
    return () => clearInterval(id);
  }, [mode, trigger]);

  const dots = STATES[idx];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {background && <rect x="0" y="0" width="100" height="100" fill={background} />}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={d.fill}
          opacity={d.opacity}
          style={{
            transition: `cx ${DUR}ms ${EASE}, cy ${DUR}ms ${EASE}, r ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`,
          }}
        />
      ))}
    </svg>
  );
}

export function SplashLogo() {
  const [showMark, setShowMark] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMark(true), 50 + DUR * 2 + 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center gap-4 bg-[color:var(--color-ink)]">
      <div className="flex flex-col items-center gap-5">
        <AnimatedLogo size={120} mode="reveal" />
        <div
          className="font-[Federo] text-2xl tracking-wide text-[#F4F1EA] transition-opacity duration-500"
          style={{ opacity: showMark ? 1 : 0 }}
        >
          nuqta va nazar
        </div>
      </div>
    </div>
  );
}
