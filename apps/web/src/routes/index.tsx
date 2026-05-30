import { Activity, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";

import { MonitorStatus } from "@orvex/types";
import { Badge, Card, StatusDot, Spinner } from "@orvex/ui";

import { useMonitors } from "@/hooks/use-monitors";

function toDotStatus(status: MonitorStatus) {
  switch (status) {
    case MonitorStatus.Up: return "up" as const;
    case MonitorStatus.Down: return "down" as const;
    case MonitorStatus.Maintenance: return "paused" as const;
    default: return "unknown" as const;
  }
}

function toBadgeVariant(status: MonitorStatus) {
  switch (status) {
    case MonitorStatus.Up: return "up" as const;
    case MonitorStatus.Down: return "down" as const;
    case MonitorStatus.Maintenance: return "paused" as const;
    default: return "neutral" as const;
  }
}

function statusLabel(status: MonitorStatus) {
  switch (status) {
    case MonitorStatus.Up: return "Up";
    case MonitorStatus.Down: return "Down";
    case MonitorStatus.Maintenance: return "Maintenance";
    default: return "Unknown";
  }
}

export default function DashboardPage() {
  const { data: monitors, isLoading } = useMonitors();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const total = monitors?.length ?? 0;
  const up = monitors?.filter((m) => m.status === MonitorStatus.Up).length ?? 0;
  const down = monitors?.filter((m) => m.status === MonitorStatus.Down).length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          {total === 0 ? "No monitors configured yet." : `Watching ${total} service${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Total
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100">{total}</p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/4">
              <Activity size={14} className="text-slate-500" />
            </span>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Operational
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-400">{up}</p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/8">
              <TrendingUp size={14} className="text-emerald-400" />
            </span>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Down
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-red-400">{down}</p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/8">
              <AlertTriangle size={14} className="text-red-400" />
            </span>
          </div>
        </Card>
      </div>

      {/* Recent monitors */}
      {total === 0 ? (
        <Card padding="lg" className="flex flex-col items-center py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4">
            <Activity size={20} className="text-slate-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-400">No monitors yet</p>
          <p className="mt-1 text-xs text-slate-600">Add your first monitor to start tracking uptime</p>
        </Card>
      ) : (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-600">
            Monitors
          </p>
          <div className="space-y-2">
            {monitors?.slice(0, 6).map((monitor) => (
              <Card
                key={monitor.id}
                padding="none"
                className="group cursor-pointer transition-all hover:border-white/10"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <StatusDot
                    status={toDotStatus(monitor.status)}
                    pulse={monitor.status === MonitorStatus.Up}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{monitor.name}</p>
                    <p className="truncate font-mono text-xs text-slate-600">{monitor.target}</p>
                  </div>
                  <Badge variant={toBadgeVariant(monitor.status)}>
                    {statusLabel(monitor.status)}
                  </Badge>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-slate-700 transition-colors group-hover:text-slate-500"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
