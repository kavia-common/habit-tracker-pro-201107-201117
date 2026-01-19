import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function readTheme() {
  try {
    const stored = window.localStorage.getItem("htp_theme");
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  /** Theme provider (light/dark) persisted in localStorage. */
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("htp_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const api = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light"))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Access theme state and toggle function. */
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
