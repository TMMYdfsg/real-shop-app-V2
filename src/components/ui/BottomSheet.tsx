import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { SPRING_SHEET } from "@/lib/motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="ui-overlay" onClick={onClose}>
      <motion.div
        ref={sheetRef}
        className="ui-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={SPRING_SHEET}
        drag="y"
        dragConstraints={{ top: 0, bottom: 120 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80) onClose();
        }}
      >
        <div className="ui-sheet__handle" />
        {title ? <div className="ui-subtitle">{title}</div> : null}
        <div className="ui-stack ui-sheet__body">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
