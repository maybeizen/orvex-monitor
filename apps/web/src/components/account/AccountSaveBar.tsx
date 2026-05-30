import { AlertCircle } from "lucide-react";

import { Button } from "@orvex/ui";

import { useAccountUnsaved } from "@/contexts/account-unsaved.context";

export function AccountSaveBar() {
  const { dirty, saving, saveChanges, discardChanges, confirmLeave, cancelLeave, pendingPath } =
    useAccountUnsaved();

  const showBar = dirty || pendingPath !== null;
  if (!showBar) return null;

  return (
    <div className="account-save-bar sticky bottom-4 z-20 rounded-xl border border-red-500/30 bg-slate-950/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-200">
              {pendingPath && !dirty
                ? "Leave without saving?"
                : "You have unsaved changes"}
            </p>
            <p className="mt-0.5 text-xs text-red-300/70">
              {pendingPath && !dirty
                ? "Switching tabs will discard edits on General."
                : "Save or discard before switching account tabs."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {pendingPath ? (
            <>
              <Button variant="ghost" size="sm" onClick={cancelLeave}>
                Stay
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                onClick={confirmLeave}
              >
                Discard & leave
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={discardChanges}
            >
              Discard
            </Button>
          )}
          {dirty ? (
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-500"
              loading={saving}
              onClick={() => void saveChanges()}
            >
              Save changes
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
