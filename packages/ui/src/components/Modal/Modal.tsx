import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface ModalSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface ModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

function ModalRoot({
  open,
  onClose,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, closeOnEscape]);

  useEffect(() => {
    if (!open) return;
    contentRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={handleBackdrop}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" aria-hidden="true" />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-xl border border-white/10",
          "bg-slate-900 shadow-2xl shadow-black/60",
          "focus:outline-none",
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(function ModalHeader(
  { title, children, onClose, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {title && <h2 className="text-base font-semibold text-slate-100">{title}</h2>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});

const ModalBody = forwardRef<HTMLDivElement, ModalSectionProps>(function ModalBody(
  { children, className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("px-5 py-4 text-slate-300", className)} {...props}>
      {children}
    </div>
  );
});

const ModalFooter = forwardRef<HTMLDivElement, ModalSectionProps>(function ModalFooter(
  { children, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 border-t border-white/8 px-5 py-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export const Dialog = Modal;
export type { ModalProps as DialogProps };
