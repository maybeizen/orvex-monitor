import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Download, KeyRound, ScanLine, ShieldCheck } from "lucide-react";

import { Button, Modal, Spinner, useToast } from "@orvex/ui";

import { confirmMfa, enrollMfa } from "@/lib/account-api";
import { extractSecretFromOtpUri } from "@/lib/otpauth";
import { MfaOtpInput } from "./MfaOtpInput";
import { MfaPasswordField } from "./MfaPasswordField";

interface MfaEnrollModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 1 | 2 | 3;

const MfaVerifyStep = memo(function MfaVerifyStep({
  otp,
  password,
  onOtpChange,
  onPasswordChange,
  loading,
}: {
  otp: string;
  password: string;
  onOtpChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-slate-400">
        Enter the 6-digit code from your authenticator app, then confirm with your
        password.
      </p>
      <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
          Authenticator code
        </p>
        <MfaOtpInput value={otp} onChange={onOtpChange} disabled={loading} />
      </div>
      <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
        <MfaPasswordField
          value={password}
          onChange={onPasswordChange}
          disabled={loading}
        />
      </div>
    </div>
  );
});

export function MfaEnrollModal({ open, onClose, onComplete }: MfaEnrollModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [qrUri, setQrUri] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const manualSecret = extractSecretFromOtpUri(qrUri);

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setOtp("");
    setPassword("");
    setBackupCodes([]);
    setKeyRevealed(false);
    setEnrollmentComplete(false);
    setQrUri("");
    setLoading(true);

    let cancelled = false;
    void enrollMfa()
      .then((res) => {
        if (cancelled) return;
        setQrUri(res.data.qrUri);
      })
      .catch((err) => {
        if (cancelled) return;
        toast({
          variant: "error",
          title: err instanceof Error ? err.message : "Failed to start enrollment",
        });
        onCloseRef.current();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, toast]);

  async function handleConfirm() {
    if (otp.length < 6 || !password) return;
    setLoading(true);
    try {
      const res = await confirmMfa(otp, password);
      setBackupCodes(res.data.backupCodes);
      setEnrollmentComplete(true);
      setStep(3);
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Invalid code or password",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleClose = useCallback(() => {
    if (enrollmentComplete) {
      onComplete();
    }
    setStep(1);
    setQrUri("");
    setOtp("");
    setPassword("");
    setBackupCodes([]);
    setEnrollmentComplete(false);
    onClose();
  }, [enrollmentComplete, onClose, onComplete]);

  const qrImageUrl = qrUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`
    : "";

  const stepMeta = [
    { label: "Scan", icon: ScanLine },
    { label: "Verify", icon: ShieldCheck },
    { label: "Backup", icon: KeyRound },
  ] as const;

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <Modal.Header
        title="Enable two-factor authentication"
        onClose={handleClose}
      />
      <Modal.Body className="space-y-6">
        <div className="flex items-center gap-2">
          {stepMeta.map(({ label, icon: Icon }, i) => {
            const n = (i + 1) as Step;
            const active = step >= n;
            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex size-8 items-center justify-center rounded-full border transition-colors duration-300 ${
                    active
                      ? "border-brand-400/40 bg-brand-500/15 text-brand-300"
                      : "border-white/10 bg-white/4 text-slate-600"
                  }`}
                >
                  <Icon size={14} />
                </div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide ${
                    active ? "text-brand-300" : "text-slate-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {loading && step === 1 && !qrUri ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : null}

        {step === 1 && qrUri ? (
          <div className="space-y-5">
            <p className="text-center text-sm leading-relaxed text-slate-400">
              Scan the QR code with Google Authenticator, 1Password, Authy, or any
              TOTP app.
            </p>
            <div className="mx-auto w-fit rounded-2xl border border-white/10 bg-white p-3 shadow-lg">
              <img
                src={qrImageUrl}
                alt="Authenticator QR code"
                width={200}
                height={200}
                className="block"
              />
            </div>
            <div className="rounded-xl border border-white/8 bg-slate-950/80 p-4">
              <p className="text-center text-xs font-medium text-slate-500">
                Can&apos;t scan? Enter this key manually
              </p>
              <button
                type="button"
                className={`mt-2 w-full break-all text-center font-mono text-sm tracking-wider text-slate-200 transition-all duration-200 ${
                  keyRevealed
                    ? "blur-none"
                    : "cursor-default select-none blur-md hover:blur-none"
                }`}
                title={keyRevealed ? undefined : "Hover to reveal setup key"}
                onMouseEnter={() => { setKeyRevealed(true); }}
                onMouseLeave={() => { setKeyRevealed(false); }}
                onFocus={() => { setKeyRevealed(true); }}
                onBlur={() => { setKeyRevealed(false); }}
              >
                {manualSecret || "—"}
              </button>
              <p className="mt-2 text-center text-[10px] text-slate-600">
                Hover or focus to reveal
              </p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <MfaVerifyStep
            otp={otp}
            password={password}
            onOtpChange={setOtp}
            onPasswordChange={setPassword}
            loading={loading}
          />
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 text-sm text-amber-100/90">
              Store these backup codes in a safe place. Each code works once if you
              lose access to your authenticator.
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-200">
              {backupCodes.map((code) => (
                <span key={code} className="tracking-wide">
                  {code}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        {step === 1 && qrUri ? (
          <Button onClick={() => { setStep(2); }}>Continue</Button>
        ) : null}
        {step === 2 ? (
          <>
            <Button variant="ghost" onClick={() => { setStep(1); }}>
              Back
            </Button>
            <Button
              loading={loading}
              disabled={otp.length < 6 || !password}
              onClick={() => void handleConfirm()}
            >
              Enable 2FA
            </Button>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(backupCodes.join("\n"));
                setCopied(true);
                setTimeout(() => { setCopied(false); }, 2000);
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              Copy
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "orvex-backup-codes.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} />
              Download
            </Button>
            <Button onClick={handleClose}>Done</Button>
          </>
        ) : null}
      </Modal.Footer>
    </Modal>
  );
}
