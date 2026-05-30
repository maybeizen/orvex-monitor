import { useParams, Link } from "react-router";
import { ArrowLeft, Clock, RefreshCw, Timer, Wifi } from "lucide-react";

import { MonitorStatus } from "@orvex/types";
import { Badge, Card, Spinner, StatusDot } from "@orvex/ui";

import { useMonitor } from "@/hooks/use-monitors";
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

const statCards: Array<{
  key: "type" | "status" | "intervalSec" | "timeoutSec";
  label: string;
  icon: typeof Wifi;
  suffix?: string;
}> = [
  { key: "type", label: "Type", icon: Wifi },
  { key: "status", label: "Status", icon: RefreshCw },
  { key: "intervalSec", label: "Interval", icon: Clock, suffix: "s" },
  { key: "timeoutSec", label: "Timeout", icon: Timer, suffix: "s" },
];

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgSlug = useOrgSlug();
  const monitorsPath = orgPath(orgSlug ?? "", "monitors");
  const { data: monitor, isLoading } = useMonitor(id ?? "");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (monitor === undefined) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-slate-500">Monitor not found.</p>
        <Link
          to={monitorsPath}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300"
        >
          <ArrowLeft size={12} /> Back to monitors
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Back link */}
      <Link
        to={monitorsPath}
        className="mb-6 flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-400"
      >
        <ArrowLeft size={12} />
        All monitors
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <StatusDot
          status={toDotStatus(monitor.status)}
          size="lg"
          pulse={monitor.status === MonitorStatus.Up}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-100">{monitor.name}</h1>
            <Badge variant={toBadgeVariant(monitor.status)}>
              {statusLabel(monitor.status)}
            </Badge>
          </div>
          <a
            href={monitor.target}
            className="mt-1 block truncate font-mono text-sm text-brand-400 transition-colors hover:text-brand-300 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {monitor.target}
          </a>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, suffix }) => {
          const raw = monitor[key as keyof typeof monitor];
          const value = String(raw) + (suffix ?? "");
          return (
            <Card key={key} padding="md">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={13} className="text-slate-600" />
                <p className="text-xs font-medium text-slate-600">{label}</p>
              </div>
              <p className="font-mono text-lg font-semibold capitalize text-slate-100">{value}</p>
            </Card>
          );
        })}
      </div>

      {/* Check history placeholder */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-600">
          Check history
        </p>
        <Card padding="lg" className="flex flex-col items-center py-12 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/4">
            <Clock size={16} className="text-slate-600" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Check history will appear here</p>
        </Card>
      </div>
    </div>
  );
}
