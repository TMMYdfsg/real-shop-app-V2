import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
}

const getFocusable = (container: HTMLElement | null) => {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute("disabled"));
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, description }) => {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const titleId = useMemo(() => `modal-${Math.random().toString(36).slice(2, 7)}`, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const focusables = getFocusable(contentRef.current);
    focusables[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "Tab") {
        const items = getFocusable(contentRef.current);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="ui-overlay" onClick={onClose}>
      <div
        ref={contentRef}
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? `${titleId}-desc` : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal__header">
          <div>
            <h2 id={titleId} className="ui-modal__title">
              {title}
            </h2>
            {description ? (
              <p id={`${titleId}-desc`} className="ui-card__description">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="閉じる">
            ✕
          </Button>
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
};
