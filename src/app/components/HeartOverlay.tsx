"use client";

import React, { useContext, useMemo } from "react";
import { ThemeContext } from "./ThemeProvider";
import { BASE_NUM_HEARTS } from "@/common/constants";

export default function HeartOverlay() {
  const { heartsEnabled } = useContext(ThemeContext);

  const NUM_HEARTS = BASE_NUM_HEARTS;

  const hearts = useMemo(() =>
    Array.from({ length: NUM_HEARTS }).map((_, i) => {
      const left = Math.random() * 100;
      const duration = 5 + Math.random() * 8;
      const delay = -Math.random() * 8;
      const size = 10 + Math.random() * 36;
      const opacity = 0.25 + Math.random() * 0.6;
      const drift = `${Math.round((Math.random() * 160 - 80))}px`;
      const rot = `${Math.round((Math.random() * 720 - 360))}deg`;
      const blur = Math.random() * 4;
      return { id: i, left, duration, delay, size, opacity, drift, rot, blur };
    }),
  [NUM_HEARTS]);

  if (!heartsEnabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      {hearts.map((h) => (
        <svg
          key={h.id}
          viewBox="0 0 32 29"
          xmlns="http://www.w3.org/2000/svg"
          className="heart absolute"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
            filter: `blur(${h.blur}px) drop-shadow(0 0 8px rgba(178,0,255,0.55))`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--drift' as any]: h.drift,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--rot' as any]: h.rot,
          }}
        >
          <path
            d="M23.6 0c-2.9 0-4.9 1.9-5.6 2.6-.7-.7-2.6-2.6-5.6-2.6C6.9 0 0 6.6 0 12.5 0 21.1 8.7 25.8 16 29c7.3-3.2 16-7.9 16-16.5C32 6.6 25.1 0 23.6 0z"
            fill="#ff54c9"
            style={{ mixBlendMode: "screen" }}
          />
        </svg>
      ))}
    </div>
  );
}
