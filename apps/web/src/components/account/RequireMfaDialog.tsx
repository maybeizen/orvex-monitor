import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button, Modal } from "@orvex/ui";

import { MfaOtpInput } from "./MfaOtpInput";

interface RequireMfaDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => Promise<void>;
  title?: string;
  description?: string;
}

export function RequireMfaDialog({
  open,
  onClose,
  onSubmit,
  title = "Two-factor authentication",
  description = "Enter the 6-digit code from your authenticator app",
}: RequireMfaDialogProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (otp.length < 6) {
      setError("Enter a 6-digit code");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(otp);
      setOtp("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Header title={title} onClose={onClose} />
      <Modal.Body className="space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-brand-400/25 bg-brand-500/10">
            <ShieldCheck size={22} className="text-brand-300" />
          </span>
          <p className="text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Authenticator code
          </p>
          <MfaOtpInput value={otp} onChange={setOtp} disabled={loading} />
        </div>
        {error ? <p className="text-center text-sm text-rose-400">{error}</p> : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button loading={loading} onClick={() => void handleSubmit()}>
          Verify
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
