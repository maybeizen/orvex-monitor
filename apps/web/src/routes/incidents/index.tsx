import { AlertTriangle } from "lucide-react";

import { Card } from "@orvex/ui";

export default function IncidentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Incidents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Open and resolved incidents across all your monitors
        </p>
      </div>

      <Card padding="lg" className="flex flex-col items-center py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8">
          <AlertTriangle size={20} className="text-amber-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">No incidents recorded</p>
        <p className="mt-1 text-xs text-slate-600">
          Incidents will appear here automatically when monitors fail
        </p>
      </Card>
    </div>
  );
}
