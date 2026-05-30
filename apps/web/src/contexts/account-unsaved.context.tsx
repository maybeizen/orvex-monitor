import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useBlocker, useNavigate } from "react-router";

interface AccountUnsavedContextValue {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  registerDiscard: (fn: () => void) => void;
  registerSaveHandler: (fn: () => void | Promise<void>) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  requestNavigate: (to: string) => boolean;
  pendingPath: string | null;
  confirmLeave: () => void;
  cancelLeave: () => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
}

const AccountUnsavedContext = createContext<AccountUnsavedContextValue | null>(null);

export function AccountUnsavedProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const discardRef = useRef<() => void>(() => {});
  const saveRef = useRef<() => void | Promise<void>>(async () => {});

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      currentLocation.pathname.startsWith("/app/account") &&
      nextLocation.pathname !== currentLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked" && blocker.location) {
      setPendingPath(blocker.location.pathname);
    }
  }, [blocker.state, blocker.location]);

  const registerDiscard = useCallback((fn: () => void) => {
    discardRef.current = fn;
  }, []);

  const registerSaveHandler = useCallback((fn: () => void | Promise<void>) => {
    saveRef.current = fn;
  }, []);

  const requestNavigate = useCallback(
    (to: string) => {
      if (!dirty) return true;
      setPendingPath(to);
      return false;
    },
    [dirty],
  );

  const confirmLeave = useCallback(() => {
    discardRef.current();
    setDirty(false);
    const target = pendingPath;
    setPendingPath(null);
    if (blocker.state === "blocked") {
      blocker.proceed?.();
      return;
    }
    if (target) navigate(target);
  }, [blocker, navigate, pendingPath]);

  const cancelLeave = useCallback(() => {
    setPendingPath(null);
    if (blocker.state === "blocked") {
      blocker.reset?.();
    }
  }, [blocker]);

  const saveChanges = useCallback(async () => {
    setSaving(true);
    try {
      await saveRef.current();
      setDirty(false);
      const target = pendingPath;
      setPendingPath(null);
      if (blocker.state === "blocked") {
        blocker.proceed?.();
      } else if (target) {
        navigate(target);
      }
    } catch {
      // Save handler shows toast; keep dirty state and pending navigation.
    } finally {
      setSaving(false);
    }
  }, [blocker, navigate, pendingPath]);

  const discardChanges = useCallback(() => {
    discardRef.current();
    setDirty(false);
    setPendingPath(null);
    if (blocker.state === "blocked") {
      blocker.reset?.();
    }
  }, [blocker]);

  return (
    <AccountUnsavedContext.Provider
      value={{
        dirty,
        setDirty,
        registerDiscard,
        registerSaveHandler,
        saving,
        setSaving,
        requestNavigate,
        pendingPath,
        confirmLeave,
        cancelLeave,
        saveChanges,
        discardChanges,
      }}
    >
      {children}
    </AccountUnsavedContext.Provider>
  );
}

export function useAccountUnsaved() {
  const ctx = useContext(AccountUnsavedContext);
  if (!ctx) {
    throw new Error("useAccountUnsaved must be used within AccountUnsavedProvider");
  }
  return ctx;
}
