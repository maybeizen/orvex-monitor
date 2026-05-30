import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Mail } from "lucide-react";

import { Button, useToast } from "@orvex/ui";

import { resendSignupConfirmation } from "@/lib/auth";

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const email = searchParams.get("email")?.trim() ?? "";

  async function handleResend() {
    if (!email) {
      toast({ variant: "error", title: "No email address to resend to" });
      return;
    }
    setSending(true);
    try {
      await resendSignupConfirmation(email);
      toast({ variant: "success", title: "Verification email sent" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to resend",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 text-center shadow-xl">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
          <Mail size={24} className="text-brand-400" />
        </span>
        <h1 className="text-xl font-semibold text-slate-50">Check your email</h1>
        {email ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            We sent a confirmation link to{" "}
            <span className="font-medium text-slate-200">{email}</span>. Open that link to
            finish creating your account, then sign in.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Open the confirmation link in your inbox, then sign in.
          </p>
        )}
        {email ? (
          <Button
            className="mt-6 w-full"
            loading={sending}
            onClick={() => void handleResend()}
          >
            Resend verification email
          </Button>
        ) : null}
        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          Not in your inbox? Check spam. If you still do not receive mail, your Supabase
          project may be using the built-in mailer, which only delivers to organization
          team addresses until you configure custom SMTP under Authentication → SMTP.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-brand-400 hover:text-brand-300"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
