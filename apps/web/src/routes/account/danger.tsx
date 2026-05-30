import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle } from "lucide-react";

import { Button, Input, Modal, useToast } from "@orvex/ui";

import { RequireMfaDialog } from "@/components/account/RequireMfaDialog";
import { useAccount } from "@/hooks/use-account";
import { deactivateAccount, reactivateAccount } from "@/lib/account-api";
import { useAuthStore } from "@/stores/auth.store";

export default function AccountDangerPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: account, refetch } = useAccount();
  const signOut = useAuthStore((s) => s.signOut);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaOpen, setMfaOpen] = useState(false);

  if (!account) return null;

  if (account.pendingDeletion) {
    const scheduled = account.deletionScheduledAt
      ? new Date(account.deletionScheduledAt).toLocaleDateString("en-US", {
          dateStyle: "long",
        })
      : "soon";

    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <div className="flex gap-3">
          <AlertTriangle className="shrink-0 text-amber-400" size={22} />
          <div>
            <h2 className="text-sm font-medium text-amber-100">Account scheduled for deletion</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your account will be permanently deleted on {scheduled}. You can reactivate before
              then to restore full access.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                void (async () => {
                  try {
                    await reactivateAccount();
                    await refetch();
                    toast({ variant: "success", title: "Account reactivated" });
                  } catch (err) {
                    toast({ variant: "error", title: err instanceof Error ? err.message : "Failed to reactivate" });
                  }
                })();
              }}
            >
              Reactivate account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  async function runDeactivate(otp?: string) {
    setLoading(true);
    try {
      await deactivateAccount(password, otp);
      await signOut();
      toast({ variant: "success", title: "Account deactivation scheduled" });
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to deactivate";
      if (msg.toLowerCase().includes("two-factor") && account?.mfaEnabled) {
        setMfaOpen(true);
        return;
      }
      toast({ variant: "error", title: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
      <h2 className="text-sm font-medium text-rose-200">Deactivate account</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Your account will enter a 30-day grace period. After that, it will be permanently
        deleted along with your organizations and monitor data. You will receive a confirmation
        email with reactivation instructions.
      </p>
      <Button variant="danger" className="mt-4" onClick={() => { setConfirmOpen(true); }}>
        Deactivate account
      </Button>

      <Modal open={confirmOpen} onClose={() => { setConfirmOpen(false); }} size="md">
        <Modal.Header title="Confirm deactivation" onClose={() => { setConfirmOpen(false); }} />
        <Modal.Body className="space-y-4">
          <p className="text-sm text-slate-400">
            Type your email <span className="font-medium text-slate-200">{account.email}</span> to
            confirm.
          </p>
          <Input
            label="Email"
            value={confirmEmail}
            onChange={(e) => { setConfirmEmail(e.target.value); }}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => { setConfirmOpen(false); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            disabled={confirmEmail !== account.email || !password}
            onClick={() => {
              if (account.mfaEnabled) {
                setConfirmOpen(false);
                setMfaOpen(true);
              } else {
                void runDeactivate();
              }
            }}
          >
            Deactivate
          </Button>
        </Modal.Footer>
      </Modal>

      <RequireMfaDialog
        open={mfaOpen}
        onClose={() => { setMfaOpen(false); }}
        onSubmit={async (otp) => runDeactivate(otp)}
        title="Confirm with 2FA"
        description="Enter your authenticator code to confirm deactivation"
      />
    </div>
  );
}
