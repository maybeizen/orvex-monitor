import { Link, useNavigate } from "react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  Globe,
  ArrowRight,
  Plus,
  RotateCw,
  Zap,
  ExternalLink,
  Check,
} from "lucide-react";

import { Badge, Button, Card } from "@orvex/ui";

import { LandingHeader } from "@/components/layout/LandingHeader";

const features = [
  {
    icon: Activity,
    title: "Uptime checks",
    description:
      "HTTP, TCP, and heartbeat monitors with configurable intervals from 30 seconds to 24 hours.",
  },
  {
    icon: AlertTriangle,
    title: "Incident tracking",
    description:
      "Automatic incident creation when checks fail, with timeline, duration, and resolution history.",
  },
  {
    icon: Bell,
    title: "Smart alerts",
    description:
      "Get notified via email, Slack, or webhook the moment something goes wrong — before users notice.",
  },
  {
    icon: Globe,
    title: "Status pages",
    description:
      "Share a public status page with your customers. Custom domain, branded, always up to date.",
  },
] as const;

const stats = [
  { value: "99.99%", label: "Platform uptime" },
  { value: "<30s", label: "Alert latency" },
  { value: "50+", label: "Check regions" },
  { value: "10k+", label: "Monitors tracked" },
] as const;

const steps = [
  {
    step: "01",
    icon: Plus,
    title: "Add a monitor",
    description:
      "Point us at any URL, port, or heartbeat endpoint. Set your check interval and thresholds.",
  },
  {
    step: "02",
    icon: RotateCw,
    title: "We watch 24/7",
    description:
      "Distributed checks run from multiple regions. Failures are detected in seconds.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Get alerted fast",
    description:
      "Incidents open automatically. Your team gets notified through channels you configure.",
  },
] as const;

const freeFeatures = [
  "5 monitors included",
  "HTTP, TCP & heartbeat checks",
  "Incident history",
  "Email & webhook notifications",
];

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Status pages", href: "#features" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
} as const;

/* ─── Mini dashboard mockup shown in the hero ─── */
function HeroMockup() {
  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0a0f1e] shadow-2xl shadow-black/60">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-500/60" />
        <span className="size-2.5 rounded-full bg-amber-500/60" />
        <span className="size-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-3 font-mono text-xs text-slate-600">orvex.io/app/monitors</span>
      </div>
      {/* Content */}
      <div className="p-4 space-y-2">
        {[
          { name: "api.acme.com", target: "https · 30s", status: "up", uptime: "99.98%" },
          { name: "db.acme.com", target: "tcp · 60s", status: "down", uptime: "–" },
          { name: "cdn.acme.com", target: "https · 5m", status: "up", uptime: "100%" },
          { name: "auth.acme.com", target: "https · 1m", status: "up", uptime: "99.94%" },
        ].map((row) => (
          <div
            key={row.name}
            className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
          >
            <span className="relative flex size-2.5 shrink-0">
              {row.status === "up" && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              )}
              <span
                className={`relative inline-flex size-2.5 rounded-full ${
                  row.status === "up"
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                    : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]"
                }`}
              />
            </span>
            <span className="flex-1 font-mono text-xs text-slate-300">{row.name}</span>
            <span className="text-xs text-slate-600">{row.target}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                row.status === "up"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {row.status === "up" ? `↑ ${row.uptime}` : "Down"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-24 md:pb-32 md:pt-28">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,211,238,0.12), transparent)",
        }}
        aria-hidden="true"
      />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%,black,transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%,black,transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <Badge variant="neutral" className="mb-6 border-brand-500/25 bg-brand-500/8 text-brand-300" dot>
          Trusted by DevOps teams worldwide
        </Badge>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl md:text-[3.75rem] md:leading-[1.08]">
          Know when it&apos;s down
          <span className="block text-brand-400">before your users do.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
          Orvex Monitor watches your services around the clock — uptime checks,
          incident tracking, and instant alerts so you fix issues before they become outages.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate("/signup")}
          >
            Start monitoring free
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/login")}
          >
            View demo
          </Button>
        </div>
        <p className="mt-5 text-sm text-slate-600">
          Free tier · 5 monitors · No credit card required
        </p>

        {/* Hero mockup */}
        <div className="mt-16">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
            Everything you need to stay online
          </h2>
          <p className="mt-4 text-slate-500">
            From simple uptime pings to full incident workflows, built for teams
            who take reliability seriously.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              padding="lg"
              className="group cursor-default transition-all duration-200 hover:border-brand-500/20 hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(34,211,238,0.04)]"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/8 transition-colors duration-200 group-hover:border-brand-500/30 group-hover:bg-brand-500/12">
                <Icon size={18} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function StatsStrip() {
  return (
    <section className="border-y border-white/[0.06] px-6 py-14">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="font-mono text-3xl font-bold tracking-tight text-brand-400 md:text-4xl">
              {value}
            </p>
            <p className="mt-1.5 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-slate-500">
            No complex setup. Add a monitor, configure alerts, and let Orvex handle the rest.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map(({ step, icon: Icon, title, description }, idx) => (
            <div key={step} className="relative flex flex-col">
              {/* Connector: extends from right edge of icon across the column gap */}
              {idx < steps.length - 1 && (
                <div
                  className="absolute top-[22px] hidden h-px md:block"
                  style={{
                    left: "44px",
                    width: "calc(100% - 44px + 2rem)",
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.08), transparent)",
                  }}
                  aria-hidden="true"
                />
              )}
              {/* Icon */}
              <div className="flex size-11 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/8">
                <Icon size={18} className="text-brand-400" />
              </div>
              {/* Content */}
              <div className="mt-5">
                <span className="font-mono text-xs font-medium text-slate-600">{step}</span>
                <h3 className="mt-1.5 text-base font-semibold text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function PricingSection() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950 p-8 md:p-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <Badge variant="up" dot className="mb-5">
                Free tier available
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
                Start free, scale when ready
              </h2>
              <p className="mt-4 text-slate-500">
                5 monitors, 1-minute checks, email alerts — everything you need to get started.
                Upgrade for more monitors, faster intervals, and team features.
              </p>
              <ul className="mt-6 space-y-3">
                {freeFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15">
                      <Check size={10} className="text-brand-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full shrink-0 rounded-xl border border-white/10 bg-slate-950 p-6 md:w-72">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-600">
                Starting at
              </p>
              <p className="mt-2 text-5xl font-extrabold tracking-tight text-slate-50">
                $0
                <span className="text-lg font-normal text-slate-600">/mo</span>
              </p>
              <p className="mt-1.5 text-sm text-slate-600">Forever free tier included</p>
              <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/signup")}>
                Start monitoring free
              </Button>
              <p className="mt-3 text-center text-xs text-slate-700">No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-brand-400 to-brand-600 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Activity size={13} className="text-slate-950" />
              </span>
              <span className="text-sm font-semibold text-slate-100">Orvex Monitor</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Uptime monitoring built for modern engineering teams.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {group}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-slate-600 transition-colors hover:text-brand-400"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-slate-700">
            &copy; {new Date().getFullYear()} Orvex Monitor. All rights reserved.
          </p>
          <div className="flex gap-2">
            {[
              { label: "GitHub" },
              { label: "Twitter" },
              { label: "LinkedIn" },
            ].map(({ label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-8 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-white/5 hover:text-brand-400"
              >
                <ExternalLink size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsStrip />
        <HowItWorksSection />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
