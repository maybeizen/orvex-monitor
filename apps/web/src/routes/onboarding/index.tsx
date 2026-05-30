import { useSearchParams } from "react-router";
import { Building2, CircleHelp, Plus } from "lucide-react";

import { Card } from "@orvex/ui";

import { CreateOrganizationForm } from "@/components/onboarding/CreateOrganizationForm";
import { OnboardingShell } from "@/components/layout/OnboardingLayout";

const docsUrl = import.meta.env.VITE_DOCS_URL ?? "https://docs.orvexmonitor.com/getting-started";

export default function OnboardingWelcomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showForm = searchParams.get("create") === "1";

  function openCreateForm() {
    setSearchParams({ create: "1" });
  }

  function closeCreateForm() {
    setSearchParams({});
  }

  return (
    <OnboardingShell wide={showForm}>
      <Card padding="lg" className="border-white/10 bg-slate-950/80 backdrop-blur-sm">
        {showForm ? (
          <CreateOrganizationForm onCancel={closeCreateForm} />
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                <Building2 size={22} className="text-brand-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                Welcome to Orvex Monitor
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
                Before you can monitor services, create an organization workspace for your team or
                personal projects.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 text-base font-semibold text-slate-950 transition-all hover:bg-brand-300"
              >
                <Plus size={18} />
                Create a New Organization
              </button>
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 text-base font-medium text-slate-200 transition-all hover:border-white/15 hover:bg-white/8"
              >
                <CircleHelp size={16} />
                Not sure? Get help
              </a>
            </div>
          </>
        )}
      </Card>
    </OnboardingShell>
  );
}
