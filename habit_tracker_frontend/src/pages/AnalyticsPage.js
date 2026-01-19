import React, { useMemo } from "react";
import { useHabits } from "../hooks/useHabits";
import { computeCompletionRate, computeLongestStreak } from "../lib/metrics";
import { toISODateLocal } from "../lib/date";
import { isFeatureEnabled } from "../lib/featureFlags";

// PUBLIC_INTERFACE
export default function AnalyticsPage() {
  /** Analytics: per-habit metrics; lightweight visuals only. */
  const { habits, loading } = useHabits();

  const rows = useMemo(() => {
    const todayISO = toISODateLocal(new Date());
    return habits
      .filter((h) => !h.archived)
      .map((h) => {
        const rate30 = computeCompletionRate(h.checkIns, 30, todayISO);
        const best = computeLongestStreak(h.checkIns);
        return { habit: h, rate30, best };
      })
      .sort((a, b) => b.habit.streak - a.habit.streak);
  }, [habits]);

  if (!isFeatureEnabled("analytics")) {
    return (
      <div className="card cardPad">
        <div style={{ fontWeight: 900 }}>Analytics disabled</div>
        <div style={{ marginTop: 6, color: "var(--muted)" }}>Enable the analytics feature flag to view metrics.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="pageTitleRow">
        <div>
          <h2>Analytics</h2>
          <p className="pageSubtitle">Streaks and completion rates (last 30 days).</p>
        </div>
      </div>

      {loading ? (
        <div className="card cardPad">Loading analytics…</div>
      ) : rows.length === 0 ? (
        <div className="card cardPad">
          <div style={{ fontWeight: 900 }}>No habits yet</div>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>Add habits to see analytics.</div>
        </div>
      ) : (
        <div className="list" aria-label="Per-habit analytics">
          {rows.map(({ habit, rate30, best }) => {
            const pct = Math.round(rate30 * 100);
            return (
              <div key={habit.id} className="listRow">
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="dot" style={{ background: habit.color || "var(--primary)" }} aria-hidden="true" />
                    <div style={{ minWidth: 0 }}>
                      <p className="listRowTitle" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {habit.name}
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                        <span className="chip">Current streak: {habit.streak || 0}</span>
                        <span className="chip">Longest streak: {best}</span>
                        <span className="chip">30-day rate: {pct}%</span>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div className="progress" aria-label={`30-day completion rate: ${pct}%`}>
                          <div style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rowActions">
                  <span className="chip">
                    <span className="dot" style={{ background: "var(--secondary)" }} aria-hidden="true" />
                    {habit.category?.trim() ? habit.category : "Uncategorized"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
