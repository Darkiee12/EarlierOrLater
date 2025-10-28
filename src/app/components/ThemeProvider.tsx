"use client";

import React, { createContext, useEffect, useState } from "react";
import HeartOverlay from "./HeartOverlay";

export type Theme = "light" | "dark" | "pink";

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  heartsEnabled: boolean;
  setHeartsEnabled: (v: boolean) => void;
}>({ theme: "light", setTheme: () => {}, heartsEnabled: true, setHeartsEnabled: () => {} });

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const v = localStorage.getItem("theme");
      if (v === "light" || v === "dark" || v === "pink") return v;
    } catch (e) {}
    return "light";
  });

  const [heartsEnabled, setHeartsEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("heartsEnabled");
      if (v === "false") return false;
    } catch (e) {}
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark", "theme-pink");
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("heartsEnabled", heartsEnabled ? "true" : "false");
    } catch (e) {}
  }, [heartsEnabled]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, heartsEnabled, setHeartsEnabled }}>
      <div>
        {children}
        {theme === "pink" && heartsEnabled && <HeartOverlay />}
      </div>
    </ThemeContext.Provider>
  );
}
