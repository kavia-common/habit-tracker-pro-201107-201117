import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useHabits } from "../hooks/useHabits";

// PUBLIC_INTERFACE
export default function CategorySidebar() {
  /** Category filter sidebar; persists selection via URL query param. */
  const { habits } = useHabits();
  const [params, setParams] = useSearchParams();
  const selected = params.get("category") || "All";

  const { categories, counts } = useMemo(() => {
    const nonArchived = habits.filter((h) => !h.archived);
    const c = new Map();
    for (const h of nonArchived) {
      const cat = (h.category || "Uncategorized").trim() || "Uncategorized";
      c.set(cat, (c.get(cat) || 0) + 1);
    }
    const list = ["All", ...Array.from(c.keys()).sort((a, b) => a.localeCompare(b))];
    const countsObj = { All: nonArchived.length };
    for (const [k, v] of c.entries()) countsObj[k] = v;
    return { categories: list, counts: countsObj };
  }, [habits]);

  function selectCategory(cat) {
    const next = new URLSearchParams(params);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setParams(next, { replace: true });
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div className="label">Categories</div>
        <div className="help">Filter your habits list</div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {categories.map((cat) => {
          const isActive = cat === selected;
          return (
            <button
              key={cat}
              type="button"
              className={`btn btnSmall ${isActive ? "btnPrimary" : ""}`}
              onClick={() => selectCategory(cat)}
              aria-current={isActive ? "true" : "false"}
              style={{ justifyContent: "space-between" }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
              <span className="chip" aria-label={`${counts[cat] || 0} habits in ${cat}`}>
                {counts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14 }} className="help">
        Tip: On mobile, use Habits page filters.
      </div>
    </div>
  );
}
