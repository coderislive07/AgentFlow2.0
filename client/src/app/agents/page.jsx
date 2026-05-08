import Image from "next/image";
import Planner from "../../../public/Workers/Planner.png";
import Researcher from "../../../public/Workers/Researcher.png";
import Developer from "../../../public/Workers/Developer.png";
import Tester from "../../../public/Workers/Tester.png";
import Reporter from "../../../public/Workers/Reporter.png";

const AGENTS = [
  {
    id: "planner",
    name: "PlanZilla",
    role: "Strategic Planner",
    description:
      "Breaks down ambitious goals into milestones, execution steps, and success metrics.",
    image: Planner,
  },
  {
    id: "researcher",
    name: "QueryLyn",
    role: "Knowledge Specialist",
    description:
      "Finds relevant insights, validates assumptions, and sources up-to-date references.",
    image: Researcher,
  },
  {
    id: "developer",
    name: "CodeWizard",
    role: "Full-Stack Developer",
    description:
      "Translates plans into production-ready code with clean architecture and integration logic.",
    image: Developer,
  },
  {
    id: "tester",
    name: "BugBuster",
    role: "QA & Reliability",
    description:
      "Inspects every output, catches edge cases, and ensures the workflow stays dependable.",
    image: Tester,
  },
  {
    id: "reporter",
    name: "DataBard",
    role: "Results Reporter",
    description:
      "Summarizes progress, creates clear reports, and makes results easy to review.",
    image: Reporter,
  },
];

export default function AgentsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Agent ecosystem</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Specialized agents built for each workflow stage.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-foreground/75 sm:text-lg">
          Every agent has a distinct role so tasks move through planning, research, implementation, testing,
          and reporting without friction.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="rounded-[2rem] border border-border/60 bg-white/5 p-6 shadow-[0_12px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10">
                <Image src={agent.image} alt={agent.output?.name || agent.name} className="h-12 w-12 object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{agent.output?.name || agent.name}</h2>
                <p className="text-sm text-foreground/70">{agent.role}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-foreground/75">{agent.description}</p>
            <div className="mt-6 inline-flex rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              Active in OpsRoom
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
