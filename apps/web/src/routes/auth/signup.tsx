import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { Button, ErrorMessage, Input, useToast } from "@orvex/ui";

import { AuthDivider, OAuthButtons } from "@/components/auth/OAuthButtons";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { getAuthErrorMessage, signUpWithEmail } from "@/lib/auth";
import { useAuthRedirectPath } from "@/hooks/use-auth-redirect";
import { signupSchema } from "@/schemas/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const redirectPath = useAuthRedirectPath();
  const completeAuthFlow = useAuthStore((s) => s.completeAuthFlow);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signupSchema.safeParse(form);
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
      const result = await signUpWithEmail(parsed.data);
      if (result.session) {
        await completeAuthFlow();
        toast({ title: "Account created", variant: "success" });
        navigate(redirectPath, { replace: true });
      } else {
        toast({
          title: "Check your email",
          description: "Confirm your address to finish signing up.",
          variant: "info",
        });
        navigate(
          `/confirm-email?email=${encodeURIComponent(parsed.data.email)}`,
          { replace: true },
        );
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start monitoring in minutes — free tier included"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons onError={setError} />
      <AuthDivider />

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => { updateField("firstName", e.target.value); }}
            {...(fieldErrors.firstName ? { error: fieldErrors.firstName } : {})}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => { updateField("lastName", e.target.value); }}
            {...(fieldErrors.lastName ? { error: fieldErrors.lastName } : {})}
          />
        </div>
        <Input
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={(e) => { updateField("username", e.target.value); }}
          {...(fieldErrors.username ? { error: fieldErrors.username } : {})}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => { updateField("email", e.target.value); }}
          {...(fieldErrors.email ? { error: fieldErrors.email } : {})}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => { updateField("password", e.target.value); }}
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
          value={form.confirmPassword}
          onChange={(e) => { updateField("confirmPassword", e.target.value); }}
          {...(fieldErrors.confirmPassword ? { error: fieldErrors.confirmPassword } : {})}
        />

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
