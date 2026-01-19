import React, { useMemo } from "react";

// PUBLIC_INTERFACE
export default function Sparkline({ values, height = 44, stroke = "var(--primary)" }) {
  /** Lightweight SVG sparkline for small trend charts. */
  const { path, area } = useMemo(() => {
    const safe = (values || []).map((v) => (Number.isFinite(v) ? v : 0));
    const max = Math.max(1, ...safe);
    const w = 140;
    const h = height;
    const pad = 3;
    const step = safe.length > 1 ? (w - pad * 2) / (safe.length - 1) : 0;

    const pts = safe.map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return [x, y];
    });

    const p = pts.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt[0].toFixed(2)} ${pt[1].toFixed(2)}`).join(" ");
    const a = `${p} L ${(pad + (safe.length - 1) * step).toFixed(2)} ${(h - pad).toFixed(2)} L ${pad} ${(h - pad).toFixed(
      2
    )} Z`;
    return { path: p, area: a };
  }, [values, height]);

  return (
    <svg width="100%" height={height} viewBox={`0 0 140 ${height}`} role="img" aria-label="7-day completion trend">
      <path d={area} fill="rgba(249, 115, 22, 0.18)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
