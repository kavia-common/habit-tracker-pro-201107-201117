import React, { useMemo } from "react";
import { getMonthDaysLocal, toISODateLocal } from "../lib/date";

// PUBLIC_INTERFACE
export default function MonthHeatmap({ referenceDate, countsByDateISO, max }) {
  /** Simple month heatmap (7 cols) using completion counts per day. */
  const { days, leadingBlanks } = useMemo(() => {
    const date = referenceDate || new Date();
    const monthDays = getMonthDaysLocal(date);
    const first = monthDays[0];
    // Monday-start index: Mon=0 ... Sun=6
    const dow = (first.getDay() + 6) % 7;
    return { days: monthDays, leadingBlanks: dow };
  }, [referenceDate]);

  const safeMax = Math.max(1, max || 1);

  return (
    <div>
      <div className="label">This month</div>
      <div className="help">Daily completion count (all habits)</div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 6
        }}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`b_${i}`} style={{ height: 18 }} />
        ))}

        {days.map((d) => {
          const iso = toISODateLocal(d);
          const count = countsByDateISO?.[iso] || 0;
          const alpha = count <= 0 ? 0 : 0.14 + 0.78 * Math.min(1, count / safeMax);
          const bg = count <= 0 ? "transparent" : `rgba(249, 115, 22, ${alpha.toFixed(3)})`;

          return (
            <div
              key={iso}
              title={`${iso}: ${count}`}
              aria-label={`${iso}: ${count} completions`}
              style={{
                height: 18,
                borderRadius: 6,
                border: `1px solid ${count > 0 ? "rgba(249, 115, 22, 0.25)" : "var(--border)"}`,
                background: bg
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
