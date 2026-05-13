import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      const root = document.getElementById("root");
      if (root) root.style.pointerEvents = "none";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      const root = document.getElementById("root");
      if (root) root.style.pointerEvents = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-7xl",
  };

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50  overflow-hidden flex items-center justify-center bg-neutral-dark/50 p-2 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={`w-full ${sizes[size]} rounded-2xl relative bg-surface shadow-xl animate-scaleIn`}
      >
        <button
          onClick={onClose}
          className="rounded-lg absolute top-4 right-4 p-1.5 text-neutral-dark/50 hover:text-neutral-dark cursor-pointer transition-colors hover:bg-neutral-light-hover"
        >
          <XIcon size={20} weight="bold" />
        </button>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
