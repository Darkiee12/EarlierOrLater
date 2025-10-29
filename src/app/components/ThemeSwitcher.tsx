"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ThemeContext } from "./ThemeProvider";

const LABELS: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  pink: "Pink",
};

const ICONS: Record<string, string> = {
  light: "🌞",
  dark: "🌙",
  pink: "💖",
};

export default function ThemeSwitcher() {
  const { theme, setTheme, heartsEnabled, setHeartsEnabled } =
    useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={ref} className="fixed top-3 left-3 z-50">
      <div className="relative">
        {/* Main Theme Button */}
        <button
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-md shadow-md border transition-colors duration-200",
            {
              "bg-white text-gray-800 border-gray-200": theme === "light",
              "bg-neutral-900 text-white border-neutral-700": theme === "dark",
              "bg-pink-500 text-white border-pink-400 hover:bg-pink-600":
                theme === "pink",
            },
          )}
        >
          <span className="text-lg">{ICONS[theme]}</span>
          <span className="font-medium text-sm">{LABELS[theme]}</span>
          <span className="ml-2 text-xs opacity-70">▾</span>
        </button>

        {/* Dropdown */}
        {open && (
          <ul
            className={clsx(
              "absolute left-0 mt-2 w-40 rounded-md shadow-lg border overflow-hidden backdrop-blur-sm transition-colors duration-200",
              {
                "bg-white/95 border-gray-200": theme === "light",
                "bg-black/80 border-neutral-700": theme === "dark",
                "bg-pink-100 border-pink-400": theme === "pink",
              },
            )}
          >
            {(["light", "dark", "pink"] as const).map((t) => (
              <li key={t}>
                <button
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-3 py-2 flex items-center gap-2 transition-colors duration-150",
                    {
                      "hover:bg-gray-100": theme === "light",
                      "hover:bg-neutral-800": theme === "dark",
                      "hover:bg-pink-200": theme === "pink",
                    },
                  )}
                >
                  <span className="text-lg">{ICONS[t]}</span>
                  <span className="flex-1">{LABELS[t]}</span>
                  {theme === t && <span className="text-sm opacity-70">✓</span>}
                </button>
              </li>
            ))}

            {/* Hearts toggle */}
            <li>
              <div className="px-3 py-2 border-t text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Hearts</span>
                  <span className="text-xs opacity-70">(pink only)</span>
                </div>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={heartsEnabled}
                    onChange={(e) => setHeartsEnabled(e.target.checked)}
                    aria-label="Enable hearts overlay"
                  />
                  <span
                    className={clsx(
                      "w-9 h-5 block rounded-full transition-colors duration-200",
                      heartsEnabled ? "bg-pink-500" : "bg-gray-300",
                    )}
                    aria-hidden
                  >
                    <span
                      className={clsx(
                        "block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200",
                        heartsEnabled ? "translate-x-4" : "translate-x-0",
                      )}
                      style={{ margin: "3px" }}
                    />
                  </span>
                </label>
              </div>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
