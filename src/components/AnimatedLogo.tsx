import { useEffect, useState } from "react";

type Dot = { cx: number; cy: number; r: number; fill: string; opacity: number };

// Palette
const ORANGE = "#F66434";
const WHITE = "#FFFFFF";
const GRAY = "#BEBBBC";
const NAVY = "#0A0E29";

// idx2 is always orange (center). Others follow dark/light palette.
// Dark mode: top-2 = gray, bottom-2 = white. Light mode: all 4 outer = navy.
function buildStates(mode: "dark" | "light"): Dot[][] {
  const top = mode === "dark" ? GRAY : NAVY;
  const bottom = mode === "dark" ? WHITE : NAVY;
  return [
    // 0 — "Circle": 5 dots evenly spaced around (50, 46)
    [
      { cx: 50, cy: 14, r: 4.5, fill: top, opacity: 1 },
      { cx: 80.4, cy: 36.1, r: 4.5, fill: top, opacity: 1 },
      { cx: 68.8, cy: 71.9, r: 5.5, fill: ORANGE, opacity: 1 },
      { cx: 31.2, cy: 71.9, r: 4.5, fill: bottom, opacity: 1 },
      { cx: 19.6, cy: 36.1, r: 4.5, fill: bottom, opacity: 1 },
    ],
    // 1 — "Line": horizontal at y=46, orange centered
    [
      { cx: 15, cy: 46, r: 4.5, fill: top, opacity: 1 },
      { cx: 32.5, cy: 46, r: 4.5, fill: top, opacity: 1 },
      { cx: 50, cy: 46, r: 5.5, fill: ORANGE, opacity: 1 },
      { cx: 67.5, cy: 46, r: 4.5, fill: bottom, opacity: 1 },
      { cx: 85, cy: 46, r: 4.5, fill: bottom, opacity: 1 },
    ],
    // 2 — Final composition (production asymmetric layout)
    [
      { cx: 14.81, cy: 20.33, r: 6.98, fill: top, opacity: 1 },
      { cx: 75.78, cy: 9.82, r: 5.37, fill: top, opacity: 1 },
      { cx: 45.93, cy: 42.58, r: 10.69, fill: ORANGE, opacity: 1 },
      { cx: 85.03, cy: 69.16, r: 7.88, fill: bottom, opacity: 1 },
      { cx: 9.25, cy: 78.41, r: 9.25, fill: bottom, opacity: 1 },
    ],
  ];
}

const EASE = "cubic-bezier(.65,0,.35,1)";
const DUR = 900;

export type AnimatedLogoProps = {
  size?: number;
  mode?: "loop" | "pulse" | "reveal";
  /** color scheme — "dark" for navy backgrounds (default), "light" for white */
  scheme?: "dark" | "light";
  background?: string;
  className?: string;
  trigger?: string | number;
};

export function AnimatedLogo({
  size = 96,
  mode = "reveal",
  scheme = "dark",
  background,
  className,
  trigger,
}: AnimatedLogoProps) {
  const [idx, setIdx] = useState(mode === "pulse" ? 1 : 0);
  const states = buildStates(scheme);

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
    setIdx(0);
    let step = 0;
    const id = setInterval(() => {
      step = (step + 1) % states.length;
      setIdx(step);
    }, DUR + 250);
    return () => clearInterval(id);
  }, [mode, trigger]);

  const dots = states[idx];

  return (
    <svg
      viewBox="0 0 100 92"
      width={size}
      height={(size * 92) / 100}
      className={className}
      aria-hidden="true"
    >
      {background && <rect x="0" y="0" width="100" height="92" fill={background} />}
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
    <div className="fixed inset-0 z-[100] grid place-items-center gap-4" style={{ background: "#0A0E29" }}>
      <div className="flex flex-col items-center gap-5">
        <AnimatedLogo size={120} mode="reveal" scheme="dark" />
        <div
          className="text-2xl tracking-wide transition-opacity duration-500"
          style={{ opacity: showMark ? 1 : 0, fontFamily: "'Audiowide', system-ui, sans-serif", fontWeight: 400, color: "#FFFFFF", letterSpacing: "0.02em" }}
        >
          nuqta va nazar
        </div>

      </div>
    </div>
  );
}
