import { useEffect, useState } from "react";

type Dot = { cx: number; cy: number; r: number; fill: string; opacity: number };

const STATES: Dot[][] = [
  // 0 — scattered wide
  [
    { cx: 50, cy: 12, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 86.1, cy: 38.3, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 72.3, cy: 80.7, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 27.7, cy: 80.7, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 13.9, cy: 38.3, r: 4, fill: "#F4F1EA", opacity: 1 },
  ],
  // 1 — narrowed
  [
    { cx: 66.1, cy: 30.8, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 73.2, cy: 59.4, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 48.3, cy: 74.9, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 25.7, cy: 56.0, r: 4, fill: "#F4F1EA", opacity: 1 },
    { cx: 36.7, cy: 28.8, r: 4, fill: "#F4F1EA", opacity: 1 },
  ],
  // 2 — final composition
  [
    { cx: 50, cy: 50, r: 7, fill: "#E8562D", opacity: 1 },
    { cx: 26, cy: 71, r: 4.6, fill: "#F4F1EA", opacity: 1 },
    { cx: 75, cy: 64, r: 4.3, fill: "#F4F1EA", opacity: 1 },
    { cx: 32, cy: 34, r: 3.2, fill: "#F4F1EA", opacity: 0.75 },
    { cx: 71, cy: 23, r: 3.0, fill: "#F4F1EA", opacity: 0.7 },
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
            transition: `cx ${DUR}ms ${EASE}, cy ${DUR}ms ${EASE}, r ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}, fill ${DUR}ms ${EASE}`,
          }}
        />
      ))}
    </svg>
  );
}

export function SplashLogo() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[color:var(--color-ink)]">
      <AnimatedLogo size={120} mode="loop" />
    </div>
  );
}
