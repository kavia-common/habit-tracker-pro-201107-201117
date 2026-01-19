import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHabits } from "../hooks/useHabits";
import { useToast } from "../components/ToastProvider";
import { toISODateLocal } from "../lib/date";

// PUBLIC_INTERFACE
export default function HabitsPage() {
  /** Habits list with quick check-in, edit, and archive actions. */
  const { habits, loading, archiveHabit, deleteHabit, toggleToday } = useHabits();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const selected = params.get("category") || "All";
  const [showArchived, setShowArchived] = useState(false);

  const { active, archived } = useMemo(() => {
    const a = habits.filter((h) => !h.archived);
    const ar = habits.filter((h) => h.archived);

    const normalizeCategory = (h) => ((h.category || "Uncategorized").trim() || "Uncategorized");
    const filtered =
      selected === "All"
        ? a
        : a.filter((h) => normalizeCategory(h).toLowerCase() === selected.toLowerCase());

    return { active: filtered, archived: ar };
  }, [habits, selected]);

  async function onToggleToday(habit) {
    try {
      const updated = await toggleToday(habit.id);
      const iso = toISODateLocal(new Date());
      toast.success(updated.checkIns?.[iso] ? "Checked in for today." : "Removed today check-in.", habit.name);
    } catch {
      toast.danger("Unable to update check-in. Please try again.");
    }
  }

  async function onArchive(habit) {
    try {
      await archiveHabit(habit.id, true);
      toast.info("Habit archived.", habit.name);
    } catch {
      toast.danger("Unable to archive habit.");
    }
  }

  async function onRestore(habit) {
    try {
      await archiveHabit(habit.id, false);
      toast.success("Habit restored.", habit.name);
    } catch {
      toast.danger("Unable to restore habit.");
    }
  }

  async function onDelete(habit) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete "${habit.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteHabit(habit.id);
      toast.info("Habit deleted.", habit.name);
    } catch {
      toast.danger("Unable to delete habit.");
    }
  }

  return (
    <div>
      <div className="pageTitleRow">
        <div>
          <h2>Habits</h2>
          <p className="pageSubtitle">Create habits, check in daily, and build streaks.</p>
        </div>
        <div>
          <button className="btn btnPrimary" type="button" onClick={() => navigate("/habits/new")}>
            Add habit
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card cardPad">Loading habits…</div>
      ) : active.length === 0 ? (
        <div className="card cardPad">
          <div style={{ fontWeight: 900 }}>No habits in this category</div>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>Add a habit to get started.</div>
        </div>
      ) : (
        <div className="list" aria-label="Habits list">
          {active.map((h) => (
            <div key={h.id} className="listRow">
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="dot" style={{ background: h.color || "var(--primary)" }} aria-hidden="true" />
                  <div style={{ minWidth: 0 }}>
                    <p className="listRowTitle" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {h.name}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                      <span className="chip">
                        <span className="dot" style={{ background: "var(--secondary)" }} aria-hidden="true" />
                        {h.category?.trim() ? h.category : "Uncategorized"}
                      </span>
                      <span className="chip">Streak: {h.streak || 0}</span>
                    </div>
                    {h.description ? <p className="listRowDesc">{h.description}</p> : null}
                  </div>
                </div>
              </div>

              <div className="rowActions">
                <button className="btn btnSmall btnPrimary" type="button" onClick={() => onToggleToday(h)}>
                  Check-in
                </button>
                <button className="btn btnSmall" type="button" onClick={() => navigate(`/habits/${h.id}/edit`)}>
                  Edit
                </button>
                <button className="btn btnSmall btnGhost" type="button" onClick={() => onArchive(h)}>
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <button className="btn btnSmall btnGhost" type="button" onClick={() => setShowArchived((s) => !s)}>
          {showArchived ? "Hide" : "Show"} archived ({archived.length})
        </button>

        {showArchived && archived.length > 0 ? (
          <div style={{ marginTop: 10 }} className="list" aria-label="Archived habits list">
            {archived.map((h) => (
              <div key={h.id} className="listRow">
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="dot" style={{ background: h.color || "var(--primary)" }} aria-hidden="true" />
                    <div style={{ minWidth: 0 }}>
                      <p className="listRowTitle" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {h.name}
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                        <span className="chip">{h.category?.trim() ? h.category : "Uncategorized"}</span>
                        <span className="chip">Streak: {h.streak || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rowActions">
                  <button className="btn btnSmall btnPrimary" type="button" onClick={() => onRestore(h)}>
                    Restore
                  </button>
                  <button className="btn btnSmall btnDanger" type="button" onClick={() => onDelete(h)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showArchived && archived.length === 0 ? (
          <div style={{ marginTop: 10 }} className="card cardPad">
            <div style={{ fontWeight: 900 }}>No archived habits</div>
            <div style={{ marginTop: 6, color: "var(--muted)" }}>Archived habits will appear here.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
