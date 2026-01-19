import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", label: "Dashboard" },
  { path: "/habits", label: "Habits" },
  { path: "/analytics", label: "Analytics" },
  { path: "/settings", label: "Settings" }
];

// PUBLIC_INTERFACE
export default function BottomTabs() {
  /** Mobile bottom tabs for primary routes. */
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <div className="tabs">
      {tabs.map((t) => {
        const active = isActive(t.path);
        return (
          <button
            key={t.path}
            className={`tab ${active ? "tabActive" : ""}`}
            type="button"
            onClick={() => navigate(t.path)}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
