// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light") return false;
  if (saved === "dark") return true;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialTheme);

  // Apply the theme class + background, and persist the choice
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    document.body.style.background = dark ? "#0f172a" : "#f8fafc";
  }, [dark]);

  // Set the fade transition once, rather than re-writing it on every toggle
  useEffect(() => {
    document.body.style.transition = "background 0.2s ease";
  }, []);

  // Keep theme in sync if the user changes it in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setDark(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ dark, setDark, toggleTheme: () => setDark((d) => !d) }),
    [dark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
}