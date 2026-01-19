import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

function getFocusable(container) {
  if (!container) return [];
  const selectors = [
    'a[href]',
    "button:not([disabled])",
    "textarea:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(container.querySelectorAll(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

// PUBLIC_INTERFACE
export default function Modal({
  isOpen,
  title,
  children,
  footer,
  onClose,
  ariaDescriptionId
}) {
  /** Portal modal with basic focus trap for keyboard navigation. */
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  const titleId = useMemo(() => `modal_title_${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    if (!isOpen) return;

    lastActiveRef.current = document.activeElement;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = getFocusable(panelRef.current);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === panelRef.current) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Focus first focusable element (or the panel).
    setTimeout(() => {
      const focusables = getFocusable(panelRef.current);
      (focusables[0] || panelRef.current)?.focus?.();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const prev = lastActiveRef.current;
      if (prev && prev.focus) prev.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modalOverlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        className="modalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescriptionId}
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="modalHeader">
          <div style={{ display: "grid", gap: 4 }}>
            <h3 className="modalTitle" id={titleId}>
              {title}
            </h3>
          </div>
          <button className="btn btnSmall btnGhost" type="button" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </header>

        <div className="modalBody">{children}</div>

        {footer ? <footer className="modalFooter">{footer}</footer> : null}
      </section>
    </div>,
    document.body
  );
}
