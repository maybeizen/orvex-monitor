import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Shield, ShieldOff } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";

import { UserOAuthProvider } from "@orvex/types";
import { Badge, Button, Input, useToast } from "@orvex/ui";

import { OAuthProviderIcon } from "@/components/auth/OAuthProviderIcon";
import { MfaDisableModal } from "@/components/account/MfaDisableModal";
import { MfaEnrollModal } from "@/components/account/MfaEnrollModal";
import { RequireMfaDialog } from "@/components/account/RequireMfaDialog";
import { useAccount } from "@/hooks/use-account";
import {
  changeEmail,
  changePassword,
  fetchOAuth,
  syncOAuth,
} from "@/lib/account-api";
import { getAuthErrorMessage, linkOAuthProvider, unlinkOAuthProvider } from "@/lib/auth";
import { z } from "zod";

const passwordChangeSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const providerMeta: Array<{ id: Provider; label: string; enum: UserOAuthProvider }> = [
  { id: "google", label: "Google", enum: UserOAuthProvider.Google },
  { id: "github", label: "GitHub", enum: UserOAuthProvider.GitHub },
];

export default function AccountSecurityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: account, refetch } = useAccount();
  const oauthQuery = useQuery({
    queryKey: ["account", "oauth"],
    queryFn: async () => (await fetchOAuth()).data.linkedProviders,
  });

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [mfaDialog, setMfaDialog] = useState<"email" | "password" | null>(null);
  const [linking, setLinking] = useState<Provider | null>(null);

  const linked = new Set(oauthQuery.data ?? account?.linkedProviders ?? []);

  async function handleEmailChange(otp?: string) {
    try {
      await changeEmail(newEmail, otp);
      setNewEmail("");
      toast({ variant: "success", title: "Verification email sent to your new address" });
      void refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update email";
      if (msg.toLowerCase().includes("two-factor") && account?.mfaEnabled) {
        setMfaDialog("email");
        return;
      }
      toast({ variant: "error", title: msg });
    }
  }

  async function handlePasswordChange(otp?: string) {
    const parsed = passwordChangeSchema.safeParse({
      password: newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      toast({ variant: "error", title: parsed.error.issues[0]?.message ?? "Invalid password" });
      return;
    }
    try {
      await changePassword(currentPassword, newPassword, otp);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ variant: "success", title: "Password updated" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      if (msg.toLowerCase().includes("two-factor") && account?.mfaEnabled) {
        setMfaDialog("password");
        return;
      }
      toast({ variant: "error", title: msg });
    }
  }

  async function handleLink(provider: Provider) {
    setLinking(provider);
    try {
      await linkOAuthProvider(provider);
    } catch (err) {
      toast({ variant: "error", title: getAuthErrorMessage(err) });
      setLinking(null);
    }
  }

  async function handleUnlink(provider: Provider) {
    try {
      await unlinkOAuthProvider(provider);
      await syncOAuth();
      void queryClient.invalidateQueries({ queryKey: ["account"] });
      toast({ variant: "success", title: "Provider unlinked" });
    } catch (err) {
      toast({ variant: "error", title: getAuthErrorMessage(err) });
    }
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-slate-200">Email address</h2>
        <p className="mt-1 text-xs text-slate-500">
          Current: {account.email}
          {!account.emailVerified ? (
            <Badge variant="neutral" className="ml-2">
              Unverified
            </Badge>
          ) : null}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="New email"
            type="email"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); }}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (account.mfaEnabled) setMfaDialog("email");
              else void handleEmailChange();
            }}
          >
            Update email
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-slate-200">Password</h2>
        <div className="mt-4 space-y-3">
          <Input
            label="Current password"
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); }}
          />
          <Input
            label="New password"
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); }}
          />
          <Input
            label="Confirm new password"
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); }}
            rightIcon={
              <button
                type="button"
                className="text-slate-500 hover:text-slate-300"
                onClick={() => { setShowPasswords((v) => !v); }}
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (account.mfaEnabled) setMfaDialog("password");
              else void handlePasswordChange();
            }}
          >
            Change password
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-slate-200">Connected accounts</h2>
        <p className="mt-1 text-xs text-slate-500">Link Google or GitHub for sign-in</p>
        <div className="mt-4 space-y-3">
          {providerMeta.map(({ id, label, enum: providerEnum }) => {
            const isLinked = linked.has(providerEnum);
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/2 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <OAuthProviderIcon provider={id} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500">
                      {isLinked ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {isLinked ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleUnlink(id)}
                  >
                    Unlink
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={linking === id}
                    onClick={() => void handleLink(id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              {account.mfaEnabled ? (
                <Shield size={16} className="text-emerald-400" />
              ) : (
                <ShieldOff size={16} className="text-slate-500" />
              )}
              Two-factor authentication
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {account.mfaEnabled
                ? "Your account is protected with an authenticator app"
                : "Add an extra layer of security to your account"}
            </p>
          </div>
          {account.mfaEnabled ? (
            <Button variant="secondary" onClick={() => { setDisableOpen(true); }}>
              Disable
            </Button>
          ) : (
            <Button onClick={() => { setEnrollOpen(true); }}>Enable 2FA</Button>
          )}
        </div>
      </div>

      <MfaEnrollModal
        open={enrollOpen}
        onClose={() => { setEnrollOpen(false); }}
        onComplete={() => void refetch()}
      />
      <MfaDisableModal
        open={disableOpen}
        onClose={() => { setDisableOpen(false); }}
        onComplete={() => void refetch()}
      />
      <RequireMfaDialog
        open={mfaDialog !== null}
        onClose={() => { setMfaDialog(null); }}
        onSubmit={async (otp) => {
          if (mfaDialog === "email") await handleEmailChange(otp);
          if (mfaDialog === "password") await handlePasswordChange(otp);
        }}
      />
    </div>
  );
}
