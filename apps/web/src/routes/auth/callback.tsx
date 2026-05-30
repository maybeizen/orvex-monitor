import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Spinner, useToast } from "@orvex/ui";

import { getAuthErrorMessage } from "@/lib/auth";
import { syncOAuth } from "@/lib/account-api";
import { useAuthRedirectPath } from "@/hooks/use-auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const redirectPath = useAuthRedirectPath();
  const completeAuthFlow = useAuthStore((s) => s.completeAuthFlow);
  const [error, setError] = useState<string | null>(null);
  const isLinkFlow = new URLSearchParams(window.location.search).get("link") === "1";

  useEffect(() => {
    void (async () => {
      try {
        const session = await completeAuthFlow();
        if (isLinkFlow) {
          await syncOAuth();
          toast({ title: "Account connected", variant: "success" });
          navigate("/app/account/security", { replace: true });
          return;
        }
        if (session.mfaRequired && !session.mfaVerified) {
          const redirect = encodeURIComponent(redirectPath);
          navigate(`/2fa?redirect=${redirect}`, { replace: true });
          return;
        }
        toast({ title: "Signed in successfully", variant: "success" });
        navigate(redirectPath, { replace: true });
      } catch (err) {
        setError(getAuthErrorMessage(err));
      }
    })();
  }, [completeAuthFlow, isLinkFlow, navigate, redirectPath, toast]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          type="button"
          className="text-sm font-medium text-brand-400 hover:text-brand-300"
          onClick={() => { navigate("/login", { replace: true }); }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Spinner size="lg" />
    </div>
  );
}
