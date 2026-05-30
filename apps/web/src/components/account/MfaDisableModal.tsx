import { useState } from "react";
import { ShieldOff } from "lucide-react";

import { Button, Modal, useToast } from "@orvex/ui";

import { disableMfa } from "@/lib/account-api";
import { MfaOtpInput } from "./MfaOtpInput";
import { MfaPasswordField } from "./MfaPasswordField";

interface MfaDisableModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function MfaDisableModal({ open, onClose, onComplete }: MfaDisableModalProps) {
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await disableMfa(otp, password);
      toast({ variant: "success", title: "Two-factor authentication disabled" });
      onComplete();
      onClose();
      setOtp("");
      setPassword("");
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to disable 2FA",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header title="Disable two-factor authentication" onClose={onClose} />
      <Modal.Body className="space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10">
            <ShieldOff size={22} className="text-rose-400" />
          </span>
          <p className="text-sm leading-relaxed text-slate-400">
            Confirm with your authenticator code (or a backup code) and your account
            password.
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
          <MfaOtpInput value={otp} onChange={setOtp} disabled={loading} />
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
          <MfaPasswordField
            value={password}
            onChange={setPassword}
            disabled={loading}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          loading={loading}
          disabled={otp.length < 6 || !password}
          onClick={() => void handleSubmit()}
        >
          Disable 2FA
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
