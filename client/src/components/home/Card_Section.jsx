"use client"
import purpleWorker from '../../../public/Workers/Researcher.png'
import Image from "next/image"
const columns = [
  {
    id: "01",
    title: "Human Software Team",
    items: [{ title: "Total project workload", pct: "100%", days: "1 Month" }],
    footer: [],
  },
  {
    id: "02",
    title: "Low-Code Team",
    items: [
      { title: "Manually build workflow", pct: "58%", days: "15 Days" },
      { title: "Debug workflow", pct: "22%", days: "9 Days" },
    ],
    footer: [],
  },
  {
    id: "03",
    title: "Single Agent Product",
    items: [
      { title: "Frequently switching between single-agent products", pct: "47%", days: "12 Days" },
      { title: "Adapt to and utilize various agent products", pct: "12%", days: "5 Days" },
      { title: "Deploy and debug", pct: "7%", days: "3 Days" },
    ],
    footer: [],
  },
  {
    id: "04",
    title: "AgentFlow",
    items: [
      { title: "Write requirements and plan tasks", pct: "1%", days: "1 Day" },
      { title: "AgentFlow for automated software coding", pct: "7%", days: "3 Days" },
      { title: "Different agents execute assigned work in parallel", pct: "7%", days: "3 Days" },
      { title: "Automated testing and deployment", pct: "1%", days: "1 Day" },
      { title: "Check Docs and Editor", pct: "1%", days: "1 Day" },
      { title: "User experience testing", pct: "1%", days: "1 Day" },
    ],
    footer: [],
  },
]

export default function Card_Section() {
  return (
    <section
      className="relative isolate w-full overflow-hidden"
      style={{
        // Local design tokens for this section
        "--af-bg": "hsl(252 40% 6%)",
        "--af-bg2": "hsl(260 45% 8%)",
        "--af-card": "hsla(260, 55%, 20%, 0.35)",
        "--af-card-strong": "hsla(260, 60%, 28%, 0.5)",
        "--af-stroke": "hsla(265, 90%, 70%, 0.25)",
        "--af-glow": "hsla(265, 100%, 70%, 0.45)",
        "--af-dot": "hsla(265, 100%, 80%, 0.08)",
        "--af-text": "hsla(0, 0%, 100%, 0.9)",
        "--af-muted": "hsla(0, 0%, 100%, 0.65)",
      }}
    >
      {/* Background: deep gradient + dotted checkerboard + vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1000px 600px at 70% 20%, hsla(265,90%,50%,0.12), transparent 60%),
            radial-gradient(800px 500px at 20% 60%, hsla(195,100%,50%,0.10), transparent 60%),
            linear-gradient(180deg, var(--af-bg), var(--af-bg2))
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-90"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, var(--af-dot) 0 1px, transparent 1px 22px),
            repeating-linear-gradient(90deg, var(--af-dot) 0 1px, transparent 1px 22px)
          `,
          maskImage: "radial-gradient(100% 100% at 50% 50%, black 50%, transparent 90%)",
        }}
      />
      
      {/* Container card (glassy) */}
      {/* align image on the upper left corner of box  */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 flex flex-col gap-12 md:gap-16">
      <Image src={purpleWorker} alt="Knowledge Base" className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 mt-4 ml-4 opacity-100"/>
        <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-8 md:p-12 lg:p-16">
          {/* subtle inner border glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px]"
            style={{
              boxShadow: "inset 0 0 0 1px hsla(265, 100%, 75%, 0.08)",
            }}
          />
          
          {/* Header */}
          <header className="mb-10 text-center md:mb-14">
      
            <h2
              className="text-balance text-3xl font-semibold tracking-tight md:text-4xl"
              style={{ color: "var(--af-text)" }}
            >
              Why a Single Agent isn’t Enough?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm md:text-base" style={{ color: "var(--af-muted)" }}>
              Discover how coordinated multi-agents in AgentFlow reduce time and cost with parallel, automated
              execution.
            </p>
          </header>

          {/* Flow SVG behind columns */}
          <div className="relative">
            <svg
              aria-hidden
              className="pointer-events-none absolute -top-6 left-0 hidden h-[420px] w-full md:block"
              fill="none"
              viewBox="0 0 1200 420"
            >
              {/* flowing ribbon from columns 1→2→3→4 */}
              <defs>
                <linearGradient id="afStroke" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="var(--af-stroke)" />
                  <stop offset="0.5" stopColor="var(--af-glow)" />
                  <stop offset="1" stopColor="var(--af-stroke)" />
                </linearGradient>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 40 180 C 220 260, 340 120, 460 220
                   S 680 320, 740 210
                   S 940 140, 1160 220"
                stroke="url(#afStroke)"
                strokeWidth="8"
                opacity="0.5"
                filter="url(#softGlow)"
              />
              {/* inner brighter core */}
              <path
                d="M 40 180 C 220 260, 340 120, 460 220
                   S 680 320, 740 210
                   S 940 140, 1160 220"
                stroke="hsla(265, 100%, 75%, 0.8)"
                strokeWidth="2"
                opacity="0.8"
              />
            </svg>

            {/* Columns */}
            <div className="relative grid grid-cols-1 items-end gap-6 md:grid-cols-4 md:gap-8">
              {columns.slice(0, 3).map((col) => (
                <Column key={col.id} {...col} tall />
              ))}
              {/* The AgentFlow column appears as stacked pill cards */}
              <AgentFlowColumn {...columns[3]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Column({ id, title, items, tall = false }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium tracking-wide" style={{ color: "var(--af-muted)" }}>
        <span className="opacity-80">{id}</span> <span className="opacity-90">{title}</span>
      </h3>

      {/* stack area */}
      <div className="flex flex-col gap-4">
        <div
          className={`rounded-2xl border p-4 md:p-6 ${tall ? "min-h-[280px] md:min-h-[360px]" : ""}`}
          style={{
            borderColor: "hsla(0,0%,100%,0.08)",
            background: "linear-gradient(180deg, var(--af-card-strong), var(--af-card))",
            boxShadow: "inset 0 0 0 1px hsla(265,100%,75%,0.06), 0 10px 30px -10px hsla(265,100%,50%,0.18)",
          }}
        >
          {/* Upper card (dominant) */}
          <div className="flex flex-col gap-3">
            {items[0] && <BigCard title={items[0].title} pct={items[0].pct} days={items[0].days} />}
          </div>
        </div>

        {/* Extra stacked cards if they exist */}
        {items.slice(1).map((it, idx) => (
          <SmallCard key={idx} {...it} />
        ))}
      </div>
    </div>
  )
}

function BigCard({ title, pct, days }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl p-4"
        style={{
          background: "linear-gradient(180deg, hsla(260,60%,28%,0.75), hsla(260,55%,24%,0.6))",
          boxShadow: "inset 0 0 0 1px hsla(265,100%,75%,0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-pretty text-base font-medium" style={{ color: "var(--af-text)" }}>
            {title}
          </p>
          <span
            className="rounded-md px-2 py-1 text-xs"
            style={{
              background: "hsla(260, 70%, 65%, 0.15)",
              color: "var(--af-text)",
            }}
          >
            {pct}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--af-muted)" }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--af-glow)" }} />
          <span>{days}</span>
        </div>
      </div>
    </div>
  )
}

function SmallCard({ title, pct, days }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: "hsla(0,0%,100%,0.08)",
        background: "linear-gradient(180deg, hsla(260,55%,22%,0.55), hsla(260,45%,18%,0.5))",
        boxShadow: "inset 0 0 0 1px hsla(265,100%,75%,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium leading-5" style={{ color: "var(--af-text)" }}>
          {title}
        </p>
        <span
          className="rounded-md px-2 py-1 text-[10px]"
          style={{
            background: "hsla(260, 70%, 65%, 0.12)",
            color: "var(--af-text)",
          }}
        >
          {pct}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--af-muted)" }}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--af-glow)" }} />
        <span>{days}</span>
      </div>
    </div>
  )
}

function AgentFlowColumn({ id, title, items }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium tracking-wide" style={{ color: "var(--af-muted)" }}>
        <span className="opacity-80">{id}</span> <span className="opacity-90">{title}</span>
      </h3>
      <div className="flex flex-col gap-3">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="rounded-2xl px-4 py-3 md:px-5 md:py-4"
            style={{
              background: "linear-gradient(180deg, hsla(265, 80%, 60%, 0.22), hsla(265, 90%, 50%, 0.18))",
              boxShadow: "inset 0 0 0 1px hsla(265,100%,75%,0.18), 0 10px 20px -12px hsla(265,90%,50%,0.28)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium leading-5" style={{ color: "var(--af-text)" }}>
                {it.title}
              </p>
              <span
                className="rounded-md px-2 py-1 text-[10px]"
                style={{
                  background: "hsla(265, 100%, 70%, 0.16)",
                  color: "var(--af-text)",
                }}
              >
                {it.pct}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--af-muted)" }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--af-glow)" }} />
              <span>{it.days}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
