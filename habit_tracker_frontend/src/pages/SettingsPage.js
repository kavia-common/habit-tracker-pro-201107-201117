import React, { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { useHabits } from "../hooks/useHabits";
import { useToast } from "../components/ToastProvider";
import { exportHabitsToCSV } from "../lib/csvExport";
import { isFeatureEnabled } from "../lib/featureFlags";

function notificationStatus() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// PUBLIC_INTERFACE
export default function SettingsPage() {
  /** Settings: notification permissions + daily reminder scheduler + exports. */
  const { settings, loading, patchSettings } = useSettings();
  const { habits } = useHabits();
  const toast = useToast();

  const [permission, setPermission] = useState(() => {
    try {
      return notificationStatus();
    } catch {
      return "unsupported";
    }
  });

  async function requestPermission() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      toast.info("Notifications are not supported in this browser.");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") toast.success("Notifications enabled.");
      else toast.info(`Notifications permission: ${result}`);
    } catch {
      toast.danger("Unable to request notification permission.");
    }
  }

  function onExportCSV() {
    try {
      exportHabitsToCSV(habits);
      toast.success("CSV export downloaded.");
    } catch {
      toast.danger("Unable to export CSV.");
    }
  }

  return (
    <div>
      <div className="pageTitleRow">
        <div>
          <h2>Settings</h2>
          <p className="pageSubtitle">Reminders, permissions, and exports.</p>
        </div>
      </div>

      {loading ? (
        <div className="card cardPad">Loading settings…</div>
      ) : (
        <>
          <div className="card cardPad">
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Notifications</div>
            <div className="help">
              Best-effort reminder scheduling while the app is open. Browsers may throttle timers in background tabs.
            </div>

            {!isFeatureEnabled("notifications") ? (
              <div style={{ marginTop: 10 }} className="help">
                Notifications are disabled by feature flag.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
                  <span className="chip">Permission: {permission}</span>
                  <button className="btn btnSmall btnPrimary" type="button" onClick={requestPermission}>
                    Request permission
                  </button>
                </div>

                <div style={{ marginTop: 14 }} className="grid2">
                  <div className="field" style={{ margin: 0 }}>
                    <div className="labelRow">
                      <label className="label" htmlFor="reminderEnabled">
                        Daily reminders
                      </label>
                      <span className="help">While this tab is open</span>
                    </div>

                    <select
                      id="reminderEnabled"
                      className="select"
                      value={settings.reminderEnabled ? "on" : "off"}
                      onChange={(e) => patchSettings({ reminderEnabled: e.target.value === "on" })}
                    >
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                  </div>

                  <div className="field" style={{ margin: 0 }}>
                    <div className="labelRow">
                      <label className="label" htmlFor="reminderTime">
                        Reminder time
                      </label>
                      <span className="help">Local time</span>
                    </div>
                    <input
                      id="reminderTime"
                      className="input"
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => patchSettings({ reminderTime: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: 12 }} className="card cardPad">
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Export</div>
            <div className="help">Download a CSV containing habits and all historical check-ins.</div>

            {!isFeatureEnabled("export_csv") ? (
              <div style={{ marginTop: 10 }} className="help">
                CSV export is disabled by feature flag.
              </div>
            ) : (
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btnPrimary" type="button" onClick={onExportCSV}>
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
