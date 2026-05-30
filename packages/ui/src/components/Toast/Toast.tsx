import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

import { cn } from "../../lib/cn";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends Required<Omit<ToastOptions, "description">> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

type ToastAction =
  | { type: "add"; toast: ToastItem }
  | { type: "remove"; id: string }
  | { type: "clear" };

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { container: string; icon: string }> = {
  success: {
    container: "border-emerald-500/20 bg-slate-900",
    icon: "text-emerald-400",
  },
  error: {
    container: "border-red-500/20 bg-slate-900",
    icon: "text-red-400",
  },
  warning: {
    container: "border-amber-500/20 bg-slate-900",
    icon: "text-amber-400",
  },
  info: {
    container: "border-brand-500/20 bg-slate-900",
    icon: "text-brand-400",
  },
};

const VariantIcon = ({ variant }: { variant: ToastVariant }) => {
  const cls = cn("size-4 shrink-0", variantStyles[variant].icon);
  switch (variant) {
    case "success": return <CheckCircle className={cls} />;
    case "error": return <XCircle className={cls} />;
    case "warning": return <AlertTriangle className={cls} />;
    case "info": return <Info className={cls} />;
  }
};

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case "add": return [...state, action.toast];
    case "remove": return state.filter((t) => t.id !== action.id);
    case "clear": return [];
    default: return state;
  }
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const styles = variantStyles[toast.variant];
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex gap-3 rounded-xl border px-4 py-3",
        "shadow-lg shadow-black/40 backdrop-blur-sm",
        styles.container,
      )}
    >
      <span className="mt-0.5"><VariantIcon variant={toast.variant} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-100">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-slate-400">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number;
}

export function ToastProvider({ children, defaultDuration = 5000 }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const dismiss = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const dismissAll = useCallback(() => dispatch({ type: "clear" }), []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      const duration = options.duration ?? defaultDuration;
      const item: ToastItem = {
        id,
        title: options.title,
        variant: options.variant ?? "info",
        duration,
        ...(options.description !== undefined ? { description: options.description } : {}),
      };
      dispatch({ type: "add", toast: item });
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [defaultDuration, dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
          >
            {toasts.map((t) => (
              <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
