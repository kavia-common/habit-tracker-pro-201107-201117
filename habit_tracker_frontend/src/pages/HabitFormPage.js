import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import { useHabits } from "../hooks/useHabits";
import { useToast } from "../components/ToastProvider";

const PALETTE = ["#F97316", "#22C55E", "#EF4444", "#3B82F6", "#A855F7", "#F59E0B", "#14B8A6", "#EC4899"];

function normalizeCategory(s) {
  return (s || "").trim();
}

// PUBLIC_INTERFACE
export default function HabitFormPage({ mode }) {
  /** Route-based habit editor shown as a modal. */
  const { habitId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { habits, createHabit, updateHabit } = useHabits();

  const isEdit = mode === "edit";
  const existing = useMemo(() => (isEdit ? habits.find((h) => h.id === habitId) : null), [habits, habitId, isEdit]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    color: "#F97316"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        category: existing.category || "",
        color: existing.color || "#F97316"
      });
    }
  }, [isEdit, existing]);

  function validate(next) {
    const e = {};
    if (!next.name || next.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (next.description && next.description.length > 240) e.description = "Description is too long (max 240).";
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const next = {
      ...form,
      name: form.name.trim(),
      category: normalizeCategory(form.category)
    };
    const e = validate(next);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      if (isEdit) {
        await updateHabit(habitId, next);
        toast.success("Habit updated.", next.name);
      } else {
        await createHabit(next);
        toast.success("Habit created.", next.name);
      }
      navigate("/habits");
    } catch {
      toast.danger("Unable to save habit. Please try again.");
    }
  }

  const title = isEdit ? "Edit habit" : "Add a new habit";
  const descId = "habit_form_desc";

  return (
    <Modal
      isOpen
      title={title}
      onClose={() => navigate("/habits")}
      ariaDescriptionId={descId}
      footer={
        <>
          <button className="btn" type="button" onClick={() => navigate("/habits")}>
            Cancel
          </button>
          <button className="btn btnPrimary" type="submit" form="habitForm">
            Save
          </button>
        </>
      }
    >
      <p id={descId} className="help" style={{ marginTop: 0 }}>
        Fill out the details below. Required fields are marked.
      </p>

      {isEdit && !existing ? (
        <div className="card cardPad">
          <div style={{ fontWeight: 900 }}>Habit not found</div>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>It may have been deleted.</div>
        </div>
      ) : (
        <form id="habitForm" onSubmit={onSubmit}>
          <div className="field">
            <div className="labelRow">
              <label className="label" htmlFor="name">
                Name (required)
              </label>
              {errors.name ? <span className="help" style={{ color: "var(--danger)" }}>{errors.name}</span> : null}
            </div>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              autoComplete="off"
              required
            />
          </div>

          <div className="field">
            <div className="labelRow">
              <label className="label" htmlFor="description">
                Description
              </label>
              {errors.description ? (
                <span className="help" style={{ color: "var(--danger)" }}>
                  {errors.description}
                </span>
              ) : (
                <span className="help">Optional</span>
              )}
            </div>
            <textarea
              id="description"
              className="textarea"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="grid2">
            <div className="field">
              <div className="labelRow">
                <label className="label" htmlFor="category">
                  Category
                </label>
                <span className="help">Optional</span>
              </div>
              <input
                id="category"
                className="input"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g., Health, Learning"
                autoComplete="off"
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <label className="label" htmlFor="color">
                  Color
                </label>
                <span className="help">Pick an accent</span>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  id="color"
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  aria-label="Habit color"
                  style={{ width: 44, height: 38, borderRadius: 10, border: "1px solid var(--border)", padding: 0 }}
                />

                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Select color ${c}`}
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: c.toLowerCase() === form.color.toLowerCase() ? "3px solid var(--text)" : "1px solid var(--border)",
                      background: c,
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
