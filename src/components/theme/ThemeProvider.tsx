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
  const [theme, setTheme] = useState<Theme>("light");
  const [heartsEnabled, setHeartsEnabled] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "pink") {
        setTheme(savedTheme);
      }
    } catch {
      // Silently ignore localStorage errors
    }

    try {
      const savedHearts = localStorage.getItem("heartsEnabled");
      if (savedHearts === "false") {
        setHeartsEnabled(false);
      }
    } catch {
      // Silently ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Silently ignore localStorage errors
    }
    
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark", "theme-pink");
    body.classList.add(`theme-${theme}`);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem("heartsEnabled", heartsEnabled ? "true" : "false");
    } catch {
      // Silently ignore localStorage errors
    }
  }, [heartsEnabled, mounted]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const body = document.body;
      if (!body.classList.contains("theme-light") && 
          !body.classList.contains("theme-dark") && 
          !body.classList.contains("theme-pink")) {
        body.classList.add("theme-light");
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, heartsEnabled, setHeartsEnabled }}>
      <div>
        {children}
        {mounted && theme === "pink" && heartsEnabled && <HeartOverlay />}
      </div>
    </ThemeContext.Provider>
  );
}
