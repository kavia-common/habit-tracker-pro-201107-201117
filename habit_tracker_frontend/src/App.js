import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import HabitsPage from "./pages/HabitsPage";
import HabitFormPage from "./pages/HabitFormPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

// PUBLIC_INTERFACE
export default function App() {
  /** Root app routes wrapped by the shell layout. */
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/habits/new" element={<HabitFormPage mode="create" />} />
        <Route path="/habits/:habitId/edit" element={<HabitFormPage mode="edit" />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
