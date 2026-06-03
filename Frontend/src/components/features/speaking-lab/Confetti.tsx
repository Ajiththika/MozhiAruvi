"use client";

import React, { useMemo } from "react";

/**
 * Dependency-free confetti burst. Renders a short-lived layer of falling
 * coloured pieces. Mount it conditionally (e.g. on a Success state) with a key
 * so it replays. Uses only Tailwind/inline styles — no external library.
 */
interface ConfettiProps {
  pieces?: number;
}

const COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7", "#ec4899"];

export function Confetti({ pieces = 40 }: ConfettiProps) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    [pieces]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-5%] block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `lab-confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes lab-confetti-fall {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default Confetti;
