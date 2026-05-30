import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ShieldCheck } from "lucide-react";

import { Button, ErrorMessage, useToast } from "@orvex/ui";

import { MfaOtpInput } from "@/components/account/MfaOtpInput";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { verifyMfaLogin } from "@/lib/account-api";
import { useAuthStore } from "@/stores/auth.store";

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const refreshApiSession = useAuthStore((s) => s.refreshApiSession);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get("redirect") ?? "/app/organizations";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (otp.replace(/\s/g, "").length < 6) {
      setError("Enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await verifyMfaLogin(otp.replace(/\s/g, ""));
      await refreshApiSession();
      toast({ title: "Verified", variant: "success" });
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Two-factor authentication"
      subtitle="Enter the code from your authenticator app"
    >
      <form
        onSubmit={(e) => { void handleSubmit(e); }}
        className="two-factor-enter flex flex-col items-center"
      >
        <span className="mb-6 flex size-12 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
          <ShieldCheck size={22} className="text-brand-400" />
        </span>

        <div className="w-full rounded-xl border border-white/8 bg-slate-900/40 p-4">
          <MfaOtpInput value={otp} onChange={setOtp} disabled={loading} />
        </div>

        {error ? (
          <div className="mt-4 w-full">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        ) : null}

        <Button type="submit" className="mt-6 w-full" loading={loading}>
          Verify code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
