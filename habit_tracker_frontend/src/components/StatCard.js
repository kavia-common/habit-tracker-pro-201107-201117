import React from "react";

// PUBLIC_INTERFACE
export default function StatCard({ label, value, hint, accent = "primary" }) {
  /** Small KPI card. */
  const border =
    accent === "secondary"
      ? "rgba(34, 197, 94, 0.35)"
      : accent === "danger"
        ? "rgba(239, 68, 68, 0.35)"
        : "rgba(249, 115, 22, 0.35)";

  return (
    <div className="card cardPad" style={{ borderColor: border }}>
      <div style={{ color: "var(--muted)", fontWeight: 900, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: "-0.02em", marginTop: 4 }}>{value}</div>
      {hint ? <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>{hint}</div> : null}
    </div>
  );
}
