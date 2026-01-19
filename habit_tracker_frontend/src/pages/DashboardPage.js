import React, { useMemo } from "react";
import { useHabits } from "../hooks/useHabits";
import StatCard from "../components/StatCard";
import MonthHeatmap from "../components/MonthHeatmap";
import Sparkline from "../components/Sparkline";
import { getLastNDaysISO, getMonthDaysLocal, toISODateLocal } from "../lib/date";
import { computeLongestStreak } from "../lib/metrics";

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard: summary + month heatmap + 7-day completion trend. */
  const { habits, loading } = useHabits();

  const computed = useMemo(() => {
    const active = habits.filter((h) => !h.archived);
    const todayISO = toISODateLocal(new Date());
    const todayDone = active.filter((h) => !!h.checkIns?.[todayISO]).length;

    const activeStreaks = active.filter((h) => (h.streak || 0) > 0).length;
    const bestStreak = active.reduce((max, h) => Math.max(max, computeLongestStreak(h.checkIns)), 0);

    // Month heatmap: count completions per day
    const monthDays = getMonthDaysLocal(new Date());
    const countsByDay = {};
    for (const d of monthDays) {
      const iso = toISODateLocal(d);
      countsByDay[iso] = active.reduce((sum, h) => sum + (h.checkIns?.[iso] ? 1 : 0), 0);
    }

    // 7-day trend: completion count per day
    const last7 = getLastNDaysISO(7, new Date());
    const trend = last7.map((iso) => active.reduce((sum, h) => sum + (h.checkIns?.[iso] ? 1 : 0), 0));

    return {
      activeCount: active.length,
      totalCount: habits.length,
      todayDone,
      activeStreaks,
      bestStreak,
      countsByDay,
      trend
    };
  }, [habits]);

  return (
    <div>
      <div className="pageTitleRow">
        <div>
          <h2>Dashboard</h2>
          <p className="pageSubtitle">A quick snapshot of your day and momentum.</p>
        </div>
      </div>

      {loading ? (
        <div className="card cardPad">Loading your habits…</div>
      ) : (
        <>
          <div className="grid3">
            <StatCard label="Active habits" value={computed.activeCount} hint="Non-archived habits" accent="secondary" />
            <StatCard
              label="Today check-ins"
              value={`${computed.todayDone}/${computed.activeCount}`}
              hint="Completed today"
              accent="primary"
            />
            <StatCard label="Best streak" value={computed.bestStreak} hint="Longest streak across habits" accent="primary" />
          </div>

          <div style={{ marginTop: 12 }} className="grid2">
            <div className="card cardPad">
              <MonthHeatmap
                referenceDate={new Date()}
                countsByDateISO={computed.countsByDay}
                max={Math.max(1, computed.activeCount)}
              />
            </div>

            <div className="card cardPad">
              <div className="label">Last 7 days</div>
              <div className="help">Total completions per day</div>
              <div style={{ marginTop: 10 }}>
                <Sparkline values={computed.trend} />
              </div>
              <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                Active streaks: <strong style={{ color: "var(--text)" }}>{computed.activeStreaks}</strong>
              </div>
            </div>
          </div>

          {computed.activeCount === 0 ? (
            <div style={{ marginTop: 12 }} className="card cardPad">
              <div style={{ fontWeight: 900 }}>No habits yet</div>
              <div style={{ marginTop: 6, color: "var(--muted)" }}>
                Go to <strong>Habits</strong> to add your first habit.
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
