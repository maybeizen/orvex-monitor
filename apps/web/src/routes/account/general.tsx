import { useCallback, useEffect, useState } from "react";

import { UserStatus } from "@orvex/types";
import { Input, Spinner, useToast } from "@orvex/ui";

import { AvatarEditor } from "@/components/account/AvatarEditor";
import { StatusPicker } from "@/components/account/StatusPicker";
import { useAccountUnsaved } from "@/contexts/account-unsaved.context";
import { useAccount, useUpdateProfile } from "@/hooks/use-account";
import { useUsernameAvailability } from "@/hooks/use-username-availability";

export default function AccountGeneralPage() {
  const { toast } = useToast();
  const { data: account, isLoading } = useAccount();
  const updateProfile = useUpdateProfile();
  const { setDirty, registerDiscard, registerSaveHandler } = useAccountUnsaved();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<UserStatus>(UserStatus.Offline);

  const usernameCheck = useUsernameAvailability(username);

  const resetToAccount = useCallback(() => {
    if (!account) return;
    setFirstName(account.firstName);
    setLastName(account.lastName);
    setUsername(account.username);
    setStatus(account.status);
    setDirty(false);
  }, [account, setDirty]);

  useEffect(() => {
    resetToAccount();
  }, [resetToAccount]);

  useEffect(() => {
    if (!account) return;
    const changed =
      firstName !== account.firstName ||
      lastName !== account.lastName ||
      username !== account.username ||
      status !== account.status;
    setDirty(changed);
  }, [account, firstName, lastName, username, status, setDirty]);

  const handleSave = useCallback(async () => {
    if (usernameCheck.reserved) {
      toast({ variant: "error", title: usernameCheck.reservedMessage });
      throw new Error("Username reserved");
    }
    if (usernameCheck.canCheck && usernameCheck.available === false) {
      toast({ variant: "error", title: "Username is already taken" });
      throw new Error("Username taken");
    }
    try {
      await updateProfile.mutateAsync({
        firstName,
        lastName,
        username,
        status,
      });
      setDirty(false);
      toast({ variant: "success", title: "Profile saved" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to save",
      });
      throw err;
    }
  }, [
    firstName,
    lastName,
    username,
    status,
    updateProfile,
    usernameCheck.available,
    usernameCheck.canCheck,
    usernameCheck.reserved,
    usernameCheck.reservedMessage,
    setDirty,
    toast,
  ]);

  useEffect(() => {
    registerDiscard(resetToAccount);
  }, [registerDiscard, resetToAccount]);

  useEffect(() => {
    registerSaveHandler(handleSave);
  }, [registerSaveHandler, handleSave]);

  if (isLoading || !account) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AvatarEditor
        account={account}
        status={status}
        saving={updateProfile.isPending}
        onSave={async (patch) => {
          await updateProfile.mutateAsync(patch);
        }}
      />

      <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-slate-200">Profile details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); }}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); }}
          />
          <div className="sm:col-span-2">
            <Input
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); }}
              {...(usernameCheck.reserved
                ? {
                    hint: usernameCheck.reservedMessage,
                    error: usernameCheck.reservedMessage,
                  }
                : usernameCheck.isChecking
                  ? { hint: "Checking availability…" }
                  : usernameCheck.canCheck && usernameCheck.available === false
                    ? { hint: "Username is taken", error: "Username is taken" }
                    : usernameCheck.canCheck && usernameCheck.available
                      ? { hint: "Username is available" }
                      : {})}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-slate-200">Presence status</h2>
        <p className="mt-1 text-xs text-slate-500">Shown to teammates in your organization</p>
        <div className="mt-4">
          <StatusPicker
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>
    </div>
  );
}
