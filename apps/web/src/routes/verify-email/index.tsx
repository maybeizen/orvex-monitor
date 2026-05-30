import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Mail } from "lucide-react";

import { Button, Spinner, useToast } from "@orvex/ui";

import { resendSignupConfirmation } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { apiUser, loading } = useAuthStore();
  const refreshApiSession = useAuthStore((s) => s.refreshApiSession);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && apiUser === null) {
      navigate("/login", { replace: true });
    }
  }, [apiUser, loading, navigate]);

  useEffect(() => {
    if (apiUser?.emailVerified) {
      navigate("/app/organizations", { replace: true });
    }
  }, [apiUser?.emailVerified, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshApiSession();
    }, 5000);
    return () => { clearInterval(interval); };
  }, [refreshApiSession]);

  async function handleResend() {
    setSending(true);
    try {
      const email = apiUser?.email;
      if (!email) throw new Error("No email on file");
      await resendSignupConfirmation(email);
      toast({ variant: "success", title: "Verification email sent" });
    } catch (err) {
      toast({ variant: "error", title: err instanceof Error ? err.message : "Failed to resend" });
    } finally {
      setSending(false);
    }
  }

  if (!apiUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="verify-email-enter flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 text-center shadow-xl">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
          <Mail size={24} className="text-brand-400" />
        </span>
        <h1 className="text-xl font-semibold text-slate-50">Verify your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          We sent a confirmation link to{" "}
          <span className="font-medium text-slate-200">{apiUser.email}</span>. Click the link in
          that email to continue using Orvex.
        </p>
        <Button className="mt-6 w-full" loading={sending} onClick={() => void handleResend()}>
          Resend verification email
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          This page refreshes automatically once your email is verified. If nothing arrives,
          check spam. Supabase&apos;s default mailer only sends to organization team emails
          until custom SMTP is configured (Authentication → SMTP in the dashboard).
        </p>
      </div>
    </div>
  );
}
