import { Settings, Bell, Shield, CreditCard } from "lucide-react";

import { Card } from "@orvex/ui";

const sections = [
  {
    icon: Settings,
    title: "General",
    description: "Account name, timezone, and display preferences",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email, Slack, and webhook alert configuration",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Password, two-factor authentication, and sessions",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Plan, usage, and payment methods",
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="space-y-3">
        {sections.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            padding="none"
            className="group cursor-pointer transition-all hover:border-white/10"
          >
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4 transition-colors group-hover:border-white/12 group-hover:bg-white/6">
                <Icon size={15} className="text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200">{title}</p>
                <p className="mt-0.5 text-xs text-slate-600">{description}</p>
              </div>
              <span className="text-xs text-slate-700 transition-colors group-hover:text-slate-500">
                →
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
