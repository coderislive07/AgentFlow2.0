"use client";

import { BarChart, Bar, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const performanceData = [
  { name: "Planner", latency: 180, tokens: 420, reliability: 92 },
  { name: "Researcher", latency: 220, tokens: 520, reliability: 95 },
  { name: "Developer", latency: 280, tokens: 610, reliability: 90 },
  { name: "Tester", latency: 160, tokens: 320, reliability: 98 },
  { name: "Reporter", latency: 140, tokens: 260, reliability: 96 },
];

export default function AnalyticsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Observability</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Real-time metrics for every agent.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-foreground/75">
          Inspect performance, identify slowdowns, and understand which agents contribute most to the system.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Latency by agent</h2>
              <p className="mt-2 text-sm text-foreground/70">Average response time in milliseconds.</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#020617", borderColor: "rgba(148,163,184,0.16)" }} />
                <Line type="monotone" dataKey="latency" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Token usage</h2>
              <p className="mt-2 text-sm text-foreground/70">Estimated model resource consumption by agent.</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#020617", borderColor: "rgba(148,163,184,0.16)" }} />
                <Bar dataKey="tokens" fill="#818cf8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Uptime</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">99.8%</p>
        </div>
        <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Success rate</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">96.5%</p>
        </div>
        <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Avg. exec time</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">2.3s</p>
        </div>
      </div>
    </section>
  );
}
