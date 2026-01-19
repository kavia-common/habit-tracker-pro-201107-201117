import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./styles/theme.css";
import "./styles/global.css";
import "./styles/components.css";
import "./App.css";

import { ThemeProvider } from "./hooks/useTheme";
import { ToastProvider } from "./components/ToastProvider";
import { HabitsProvider } from "./hooks/useHabits";
import { SettingsProvider } from "./hooks/useSettings";
import { isFeatureEnabled } from "./lib/featureFlags";

function applyThemeEarly() {
  try {
    const stored = window.localStorage.getItem("htp_theme");
    const theme = stored === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    // ignore
  }
}

applyThemeEarly();

function registerServiceWorker() {
  if (!isFeatureEnabled("pwa")) return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .catch(() => {
        // Best-effort only; app should still run without SW.
      });
  });
}

registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <HabitsProvider>
              <App />
            </HabitsProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
