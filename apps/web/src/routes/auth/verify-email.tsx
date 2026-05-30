import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CheckCircle2 } from "lucide-react";

import { ErrorMessage, Spinner } from "@orvex/ui";

import { getAuthErrorMessage, verifyEmail } from "@/lib/auth-api";

export default function AuthVerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("This verification link is invalid or has expired.");
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        await verifyEmail(token);
        setLoading(false);
      } catch (err) {
        setError(getAuthErrorMessage(err));
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 text-center shadow-xl">
          <ErrorMessage>{error}</ErrorMessage>
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 text-center shadow-xl">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
          <CheckCircle2 size={24} className="text-emerald-400" />
        </span>
        <h1 className="text-xl font-semibold text-slate-50">Email verified</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Your email address is confirmed. You can now sign in to Orvex.
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
          onClick={() => { navigate("/login", { replace: true }); }}
        >
          Continue to sign in
        </button>
      </div>
    </div>
  );
}
