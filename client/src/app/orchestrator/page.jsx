import Link from "next/link";

const STEPS = [
  {
    title: "Receive task",
    description: "The orchestrator captures the request and assigns work to specialized agents.",
  },
  {
    title: "Plan & research",
    description: "Planner and researcher validate scope and build a reliable execution roadmap.",
  },
  {
    title: "Build",
    description: "Developer generates the application, APIs, and integration flows.",
  },
  {
    title: "Validate",
    description: "Tester checks workflows, catches issues, and ensures quality before delivery.",
  },
  {
    title: "Report",
    description: "Reporter prepares the final summary and a clear outcome report.",
  },
];

export default function OrchestratorPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Orchestration core</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          The brain that routes the whole workflow.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-foreground/75">
          AgentFlow uses a centralized orchestrator layer to coordinate agents, manage state, and deliver the final result.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-[2rem] border border-border/60 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-200">
              {index + 1}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/75">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[2rem] border border-border/60 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold text-foreground">Execution flow</h2>
        <p className="mt-4 text-sm leading-7 text-foreground/75">
          The orchestrator tracks task state through a directed flow. Every step can be monitored, retried, and audited in real time.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-blue-500/5 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">State</h3>
            <p className="mt-3 text-3xl font-semibold text-foreground">DAG</p>
          </div>
          <div className="rounded-3xl bg-blue-500/5 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Agents</h3>
            <p className="mt-3 text-3xl font-semibold text-foreground">5+ specialized roles</p>
          </div>
          <div className="rounded-3xl bg-blue-500/5 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Delivery</h3>
            <p className="mt-3 text-3xl font-semibold text-foreground">Realtime updates</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/opsRoom"
          className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500/90"
        >
          Launch orchestrator
        </Link>
      </div>
    </section>
  );
}
