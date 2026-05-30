import { useState } from "react";
import { Link } from "react-router";
import { MailCheck } from "lucide-react";

import { Button, ErrorMessage, Input, useToast } from "@orvex/ui";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { forgotPassword, getAuthErrorMessage } from "@/lib/auth-api";
import { forgotPasswordSchema } from "@/schemas/auth";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(undefined);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(parsed.data.email);
      setSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
        variant: "success",
      });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a reset link to your email"
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
            <MailCheck size={22} className="text-brand-400" />
          </span>
          <p className="text-sm text-slate-300">
            If an account exists for <span className="font-medium text-slate-100">{email}</span>,
            you&apos;ll receive a reset link shortly.
          </p>
          <Link
            to="/login"
            className="mt-6 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            {...(fieldError ? { error: fieldError } : {})}
          />
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
