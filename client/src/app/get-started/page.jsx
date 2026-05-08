import Link from "next/link";

export default function GetStartedPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-border/60 bg-white/5 p-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Ready for action</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Start your first AgentFlow workflow now.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/75">
          The OpsRoom is the control center where agents collaborate, execute tasks, and surface results in real time.
        </p>
        <Link
          href="/opsRoom"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-500/90"
        >
          Open OpsRoom
        </Link>
      </div>
    </section>
  );
}
