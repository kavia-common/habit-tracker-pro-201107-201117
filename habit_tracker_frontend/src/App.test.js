import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "./App";
import { ThemeProvider } from "./hooks/useTheme";
import { ToastProvider } from "./components/ToastProvider";
import { HabitsProvider } from "./hooks/useHabits";
import { SettingsProvider } from "./hooks/useSettings";

test("renders app title", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <HabitsProvider>
              <App />
            </HabitsProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/Habit Tracker Pro/i)).toBeInTheDocument();
});
