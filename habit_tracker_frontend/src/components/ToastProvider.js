import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** App-wide toast/snackbar provider. */
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) window.clearTimeout(t);
    timersRef.current.delete(id);
  }, []);

  const push = useCallback(
    (toast) => {
      const id = makeId();
      const item = {
        id,
        title: toast.title || "Done",
        message: toast.message || "",
        variant: toast.variant || "info",
        timeoutMs: toast.timeoutMs ?? 2800
      };

      setToasts((prev) => [item, ...prev].slice(0, 4));

      const timer = window.setTimeout(() => remove(id), item.timeoutMs);
      timersRef.current.set(id, timer);
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      push,
      success: (message, title = "Saved") => push({ variant: "success", title, message }),
      info: (message, title = "Info") => push({ variant: "info", title, message }),
      danger: (message, title = "Error") => push({ variant: "danger", title, message }),
      remove
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${
              t.variant === "success" ? "toastSuccess" : t.variant === "danger" ? "toastDanger" : "toastInfo"
            }`}
            role="status"
          >
            <div className="toastTitle">{t.title}</div>
            <div className="toastMsg">{t.message}</div>
            <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btnSmall btnGhost" onClick={() => remove(t.id)} type="button">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook to show toasts from anywhere in the app. */
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
