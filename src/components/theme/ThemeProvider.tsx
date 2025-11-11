"use client";

import React, { createContext, useEffect, useState } from "react";
import HeartOverlay from "./HeartOverlay";

export type Theme = "light" | "dark" | "pink" | "system";
export type ResolvedTheme = "light" | "dark" | "pink";

export const ThemeContext = createContext<{
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  heartsEnabled: boolean;
  setHeartsEnabled: (v: boolean) => void;
}>({ theme: "system", resolvedTheme: "light", setTheme: () => {}, heartsEnabled: true, setHeartsEnabled: () => {} });

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [heartsEnabled, setHeartsEnabled] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "pink" || savedTheme === "system") {
        setTheme(savedTheme as Theme);
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
    
    const resolveTheme = (): ResolvedTheme => {
      if (theme === "system") {
        return getSystemTheme();
      }
      return theme;
    };

    const resolved = resolveTheme();
    setResolvedTheme(resolved);
    
    try {
      localStorage.setItem("theme", theme);
    } catch {
      
    }
    
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark", "theme-pink");
    body.classList.add(`theme-${resolved}`);
  }, [theme, mounted]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      const body = document.body;
      body.classList.remove("theme-light", "theme-dark", "theme-pink");
      body.classList.add(`theme-${resolved}`);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem("heartsEnabled", heartsEnabled ? "true" : "false");
    } catch {
    }
  }, [heartsEnabled, mounted]);

  useEffect(() => {
    if (typeof document !== "undefined" && !mounted) {
      const body = document.body;
      if (!body.classList.contains("theme-light") && 
          !body.classList.contains("theme-dark") && 
          !body.classList.contains("theme-pink")) {
        const initialResolved = theme === "system" ? getSystemTheme() : theme;
        body.classList.add(`theme-${initialResolved}`);
        setResolvedTheme(initialResolved);
      }
    }
  }, [mounted, theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, heartsEnabled, setHeartsEnabled }}>
      <div>
        {children}
        {mounted && resolvedTheme === "pink" && heartsEnabled && <HeartOverlay />}
      </div>
    </ThemeContext.Provider>
  );
}
