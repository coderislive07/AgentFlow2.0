import Planner from "../../../public/Workers/Planner.png"
import Researcher from "../../../public/Workers/Researcher.png"
import Developer from "../../../public/Workers/Developer.png"
import Tester from "../../../public/Workers/Tester.png"
import Reporter from "../../../public/Workers/Reporter.png"



export default function Workers() {
  const workers = [
    {
      key: "planner",
      name: "PlanZilla",
      role: "Strategic Planner",
      img: Planner,
      accent: "rgba(139,92,246,0.9)", // purple
    },
    {
      key: "researcher",
      name: "QueryLyn",
      role: "Lead Researcher",
      img: Researcher,
      accent: "rgba(99,102,241,0.9)", // indigo
    },
    {
      key: "developer",
      name: "CodeWizard",
      role: "Full‑Stack Dev",
      img: Developer,
      accent: "rgba(59,130,246,0.9)", // blue
    },
    {
      key: "tester",
      name: "BugBuster",
      role: "QA Tester",
      img: Tester,
      accent: "rgba(56,189,248,0.9)", // cyan
    },
    {
      key: "reporter",
      name: "DataBard",
      role: "Insights Reporter",
      img: Reporter,
      accent: "rgba(168,85,247,0.9)", // violet
    },
  ]

  return (
    <section
      className="relative w-full"
      aria-labelledby="workers-heading"
      style={{
        // Dotted checkerboard + layered radial glows (subtle, purple/indigo)
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)," + // dots
          "radial-gradient(1200px 600px at 70% -10%, rgba(84,58,255,0.22), transparent 55%)," + // top glow
          "radial-gradient(900px 500px at 15% 30%, rgba(255,64,160,0.10), transparent 60%)", // side glow
        backgroundSize: "22px 22px, auto, auto",
        backgroundPosition: "0 0, 0 0, 0 0",
      }}
    >
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(0,0,0,0.35),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Heading */}
        <header className="text-center mb-8 md:mb-10">
          <h2
            id="workers-heading"
            className="text-balance font-serif text-3xl md:text-5xl font-semibold tracking-tight text-foreground/90"
          >
            {"Your first Private software team"}
            <br />
            <span className="text-foreground/80">
              {"Solving "}
              <span className="text-[color:rgba(155,135,245,0.95)]">{"Complex Challenges"}</span>
            </span>
          </h2>
        </header>

        {/* Prompt bar */}
        <div className="mx-auto mb-10 md:mb-12 max-w-3xl">
          <div
            className="relative rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md px-4 md:px-6 py-3 md:py-4"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(180,150,255,0.15), 0 10px 30px rgba(80,40,200,0.25)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(180deg, rgba(139,92,246,0.35), rgba(76,29,149,0.35))",
                  boxShadow: "0 0 12px rgba(139,92,246,0.6)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90">
                  <path
                    d="M10 20l-2-2h-2a2 2 0 0 1-2-2v-3l6-8h12v9l-4 6h-8Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-foreground/70"
                  />
                </svg>
              </span>
              <p className="text-sm md:text-base text-foreground/80">
                {"Build the target application based on the input requirements document."}
              </p>
              <div className="ml-auto">
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-sm font-medium border border-border/50 text-foreground/80 hover:text-foreground"
                  style={{
                    background: "linear-gradient(180deg, rgba(112,84,248,0.25), rgba(67,56,202,0.2))",
                    boxShadow: "0 0 16px rgba(120,90,250,0.35)",
                  }}
                >
                  {"Swap"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="relative">
          {/* subtle backdrop plate */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl border border-border/30"
            style={{
              background: "linear-gradient(180deg, rgba(30,27,75,0.35), rgba(17,24,39,0.35))",
              boxShadow: "inset 0 0 0 1px rgba(180,150,255,0.12), 0 20px 60px rgba(70,30,200,0.25)",
            }}
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {workers.map((w) => (
              <WorkerCard key={w.key} worker={w} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function WorkerCard({ worker }) {
  const { name, role, img, accent } = worker
  return (
    <article
      className="group relative rounded-2xl border border-border/40 bg-background/50 backdrop-blur-md p-4 md:p-5 overflow-hidden"
      style={{
        boxShadow: "inset 0 0 0 1px rgba(180,150,255,0.10), 0 10px 30px rgba(80,40,200,0.20)",
        transition: "transform .25s ease, box-shadow .25s ease",
      }}
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(500px 200px at 50% 20%, ${accent}, transparent 60%)`,
          filter: "blur(12px)",
          transition: "opacity .25s ease",
        }}
        aria-hidden="true"
      />
      {/* Top sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 h-40 opacity-40 group-hover:opacity-60"
        style={{
          background: "radial-gradient(120px 40px at 50% 100%, rgba(255,255,255,0.35), transparent 70%)",
          mixBlendMode: "screen",
          transition: "opacity .25s ease",
        }}
        aria-hidden="true"
      />

      {/* Avatar */}
      <div className="relative z-[1] flex items-center justify-center pt-2 pb-4 md:pb-6">
        <img
          src={typeof img === "string" ? img : img?.src || ""}
          alt={`${name} avatar`}
          className="h-28 w-28 md:h-32 md:w-32 object-contain drop-shadow-[0_12px_24px_rgba(90,60,200,0.35)]"
          draggable="false"
        />
      </div>

      {/* Name ribbon */}
      <div className="relative z-[1]">
        <div
          className="mb-2 inline-flex max-w-full items-center gap-2 rounded-xl px-3 py-1.5"
          style={{
            background: "linear-gradient(180deg, rgba(112,84,248,0.28), rgba(67,56,202,0.24))",
            boxShadow: "0 0 0 1px rgba(180,150,255,0.25) inset",
          }}
        >
          <span className="text-sm font-semibold text-foreground/90 truncate">{name}</span>
          <span className="rounded-md border border-border/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/70">
            {"Team"}
          </span>
        </div>

        <p className="text-xs md:text-sm text-foreground/70">{role}</p>
      </div>

      {/* Focus outline for a11y */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-[rgba(139,92,246,0.45)] group-focus-within:ring-2" />
    </article>
  )
}
