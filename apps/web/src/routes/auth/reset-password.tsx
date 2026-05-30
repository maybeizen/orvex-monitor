import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

import { Button, ErrorMessage, Input, Spinner, useToast } from "@orvex/ui";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { getAuthErrorMessage, resetPassword } from "@/lib/auth-api";
import { resetPasswordSchema } from "@/schemas/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError("This reset link is invalid or has expired.");
    }
  }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (!token) return;

    setLoading(true);
    try {
      await resetPassword(token, parsed.data.password);
      setDone(true);
      toast({ title: "Password updated", variant: "success" });
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Reset link invalid" subtitle="Request a new password reset email">
        <ErrorMessage>{error ?? "This reset link is invalid or has expired."}</ErrorMessage>
        <Link
          to="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-brand-400 hover:text-brand-300"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 text-center shadow-xl">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </span>
          <h1 className="text-xl font-semibold text-slate-50">Password updated</h1>
          <p className="mt-3 text-sm text-slate-400">Redirecting you to sign in…</p>
          <Spinner size="sm" className="mx-auto mt-6" />
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter a strong password for your account"
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <Input
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); }}
          {...(fieldErrors.password ? { error: fieldErrors.password } : {})}
          rightIcon={
            <button
              type="button"
              className="text-slate-500 transition-colors hover:text-slate-300"
              onClick={() => { setShowPassword((v) => !v); }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); }}
          {...(fieldErrors.confirmPassword ? { error: fieldErrors.confirmPassword } : {})}
        />
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <Button type="submit" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
