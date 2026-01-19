import React from "react";
import CategorySidebar from "./CategorySidebar";
import BottomTabs from "./BottomTabs";
import { useTheme } from "../hooks/useTheme";

// PUBLIC_INTERFACE
export default function AppShell({ children }) {
  /** Layout wrapper: header/sidebar/main + mobile nav. */
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="appRoot">
      <a className="skipLink" href="#main">
        Skip to content
      </a>

      <header className="appHeader" role="banner">
        <div className="brand" aria-label="App header">
          <h1 className="brandTitle">Habit Tracker Pro</h1>
          <span className="brandTag">Playful Citrus</span>
        </div>

        <div className="headerActions">
          <button
            className="btn btnSmall btnGhost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            type="button"
          >
            Theme: {theme === "light" ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <div className="appBody">
        <aside className="sidebar" aria-label="Categories sidebar">
          <CategorySidebar />
        </aside>

        <main id="main" className="main" role="main" tabIndex={-1}>
          <div className="mainInner">{children}</div>
        </main>
      </div>

      <nav className="mobileTabs" aria-label="Bottom navigation">
        <BottomTabs />
      </nav>
    </div>
  );
}
