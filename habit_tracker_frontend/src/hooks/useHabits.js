import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as habitsApi from "../lib/storage/habits";
import { toISODateLocal } from "../lib/date";

const HabitsContext = createContext(null);

// PUBLIC_INTERFACE
export function HabitsProvider({ children }) {
  /** Loads habits from persistence and exposes operations. */
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await habitsApi.listHabits();
      setHabits(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createHabit = useCallback(async (input) => {
    const h = await habitsApi.createHabit(input);
    setHabits((prev) => [...prev, h].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    return h;
  }, []);

  const updateHabit = useCallback(async (id, patch) => {
    const h = await habitsApi.updateHabit(id, patch);
    setHabits((prev) => prev.map((x) => (x.id === id ? h : x)));
    return h;
  }, []);

  const deleteHabit = useCallback(async (id) => {
    await habitsApi.deleteHabit(id);
    setHabits((prev) => prev.filter((x) => x.id !== id));
    return true;
  }, []);

  const archiveHabit = useCallback(async (id, archived = true) => {
    const h = await habitsApi.archiveHabit(id, archived);
    setHabits((prev) => prev.map((x) => (x.id === id ? h : x)));
    return h;
  }, []);

  const toggleToday = useCallback(async (id) => {
    const today = toISODateLocal(new Date());
    const h = await habitsApi.toggleCheckIn(id, today);
    setHabits((prev) => prev.map((x) => (x.id === id ? h : x)));
    return h;
  }, []);

  const api = useMemo(
    () => ({
      habits,
      loading,
      refresh,
      createHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      toggleToday
    }),
    [habits, loading, refresh, createHabit, updateHabit, deleteHabit, archiveHabit, toggleToday]
  );

  return <HabitsContext.Provider value={api}>{children}</HabitsContext.Provider>;
}

// PUBLIC_INTERFACE
export function useHabits() {
  /** Access habit list and operations. */
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
