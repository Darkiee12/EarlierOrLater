"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
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
  const { theme, setTheme, heartsEnabled, setHeartsEnabled } = useContext(ThemeContext);
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
        <button
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          className="flex items-center gap-2 px-3 py-2 rounded-md shadow-md bg-white/90 dark:bg-black/70 border"
        >
          <span className="text-lg">{ICONS[theme]}</span>
          <span className="font-medium text-sm">{LABELS[theme]}</span>
          <span className="ml-2 text-xs opacity-70">▾</span>
        </button>

        {open && (
          <ul className="absolute left-0 mt-2 w-40 bg-white/95 dark:bg-black/80 rounded-md shadow-lg border overflow-hidden">
            {(["light", "dark", "pink"] as const).map((t) => (
              <li key={t}>
                <button
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <span className="text-lg">{ICONS[t]}</span>
                  <span className="flex-1">{LABELS[t]}</span>
                  {theme === t && <span className="text-sm opacity-70">✓</span>}
                </button>
              </li>
            ))}

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
                    className={`w-9 h-5 block rounded-full transition-colors duration-200 ${
                      heartsEnabled ? "bg-pink-500" : "bg-gray-300"
                    }`}
                    aria-hidden
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        heartsEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
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

