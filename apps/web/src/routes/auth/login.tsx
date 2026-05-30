import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { Button, ErrorMessage, Input, useToast } from "@orvex/ui";

import { AuthDivider, OAuthButtons } from "@/components/auth/OAuthButtons";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { getAuthErrorMessage, signInWithEmail } from "@/lib/auth";
import { useAuthRedirectPath } from "@/hooks/use-auth-redirect";
import { loginSchema } from "@/schemas/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const redirectPath = useAuthRedirectPath();
  const completeAuthFlow = useAuthStore((s) => s.completeAuthFlow);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(parsed.data.email, parsed.data.password);
      const session = await completeAuthFlow();
      if (session.mfaRequired && !session.mfaVerified) {
        const redirect = encodeURIComponent(redirectPath);
        navigate(`/2fa?redirect=${redirect}`, { replace: true });
        return;
      }
      toast({ title: "Welcome back", variant: "success" });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your monitors and incident dashboard"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-brand-400 hover:text-brand-300">
            Create one
          </Link>
        </>
      }
    >
      <OAuthButtons onError={setError} />
      <AuthDivider />

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); }}
          {...(fieldErrors.email ? { error: fieldErrors.email } : {})}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-slate-500 transition-colors hover:text-brand-400"
          >
            Forgot password?
          </Link>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
