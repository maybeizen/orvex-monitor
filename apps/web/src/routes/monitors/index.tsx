import { Link } from "react-router";
import { Activity, ArrowUpRight, Plus } from "lucide-react";

import { MonitorStatus } from "@orvex/types";
import { Badge, Button, Card, Spinner, StatusDot } from "@orvex/ui";

import { useMonitors } from "@/hooks/use-monitors";
import { useOrgSlug } from "@/hooks/use-org-slug";
import { orgPath } from "@/lib/org-paths";

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

export default function MonitorsPage() {
  const orgSlug = useOrgSlug();
  const { data: monitors, isLoading } = useMonitors();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const total = monitors?.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Monitors</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} service{total !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />}>
          Add monitor
        </Button>
      </div>

      {total === 0 ? (
        <Card padding="lg" className="flex flex-col items-center py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4">
            <Activity size={20} className="text-slate-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-400">No monitors yet</p>
          <p className="mt-1 text-xs text-slate-600">
            Add a monitor to start tracking uptime
          </p>
          <Button className="mt-5" size="sm" leftIcon={<Plus size={14} />}>
            Add your first monitor
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {monitors?.map((monitor) => (
            <Link key={monitor.id} to={orgPath(orgSlug ?? "", `monitors/${monitor.id}`)}>
              <Card
                padding="none"
                className="group cursor-pointer transition-all hover:border-white/10"
              >
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <StatusDot
                    status={toDotStatus(monitor.status)}
                    pulse={monitor.status === MonitorStatus.Up}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {monitor.name}
                    </p>
                    <p className="truncate font-mono text-xs text-slate-600">
                      {monitor.target}
                    </p>
                  </div>
                  <div className="hidden items-center gap-4 text-xs text-slate-600 sm:flex">
                    <span className="font-mono">{monitor.type}</span>
                    <span>{monitor.intervalSec}s</span>
                  </div>
                  <Badge variant={toBadgeVariant(monitor.status)}>
                    {statusLabel(monitor.status)}
                  </Badge>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-slate-700 transition-colors group-hover:text-slate-400"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
