import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAppSettings, updateAppSettings } from "../lib/storage/settings";
import { isFeatureEnabled } from "../lib/featureFlags";

const SettingsContext = createContext(null);

function msUntilNext(timeHHMM) {
  const [hh, mm] = (timeHHMM || "20:00").split(":").map((x) => parseInt(x, 10));
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh || 0, mm || 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function canNotify() {
  return typeof window !== "undefined" && "Notification" in window;
}

// PUBLIC_INTERFACE
export function SettingsProvider({ children }) {
  /** Settings state + reminder scheduling (best-effort while tab is open). */
  const [settings, setSettings] = useState({ reminderEnabled: false, reminderTime: "20:00" });
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await getAppSettings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Schedule reminder while app is open (limitation: background tabs may throttle timers).
    if (!isFeatureEnabled("notifications")) return;
    if (!settings.reminderEnabled) return;
    if (!canNotify()) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    const schedule = () => {
      timerRef.current = window.setTimeout(() => {
        try {
          if (Notification.permission === "granted") {
            // Basic reminder notification.
            // Note: Browser may throttle timers when tab is backgrounded.
            // This is an expected limitation for a purely client-side scheduler.
            new Notification("Habit Tracker Pro", {
              body: "Time for your daily habit check-in.",
              silent: true
            });
          }
        } catch {
          // ignore
        }
        schedule();
      }, msUntilNext(settings.reminderTime));
    };

    schedule();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [settings.reminderEnabled, settings.reminderTime]);

  const api = useMemo(
    () => ({
      settings,
      loading,
      async patchSettings(patch) {
        const next = await updateAppSettings(patch);
        setSettings(next);
        return next;
      }
    }),
    [settings, loading]
  );

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}

// PUBLIC_INTERFACE
export function useSettings() {
  /** Access persisted settings and update method. */
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
