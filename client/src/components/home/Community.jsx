"use client"
import one from '../../../public/Community/1.jpg'
import two from '../../../public/Community/2.jpg'
import three from '../../../public/Community/3.jpg'
import four from '../../../public/Community/4.jpg'
import five from '../../../public/Community/5.jpg'
import six from '../../../public/Community/6.jpg'
import seven from '../../../public/Community/7.jpg'
import eight from '../../../public/Community/8.jpg'
import nine from '../../../public/Community/9.jpg'
import ten from '../../../public/Community/10.jpg'
import eleven from '../../../public/Community/11.jpg'
import twelve from '../../../public/Community/12.jpg'
import Image from "next/image"

const DUMMY_TESTIMONIALS = [
  {
    name: "TuringPost",
    handle: "@TheTuringPost",
    avatar: one,
    quote:
      "AgentFlow: Simulates a whole software company. With one prompt, it generates user stories, requirements, APIs, docs, and more. Mind-blowing.",
  },
  {
    name: "Alex Yates",
    handle: "@yatesjalex",
    avatar: two,
    quote:
      "Just tried AgentFlow. It wrote out API specs and tasks, a complete PRD, and spun up the scaffolding. My mind is blown.",
  },
  {
    name: "Kouhei",
    handle: "@prompt_naka",
    avatar: three,
    quote: "AgentFlow 面白い！並列でエージェントがタスクを進めるのが気持ちいい。開発フローの未来を感じた。",
  },
  {
    name: "Sanyam Bhutani",
    handle: "@sanyambhutani",
    avatar: four,
    quote:
      "A masterpiece for applying LLM agents. AgentFlow is a golden treat on how AI teams can collaborate, like real teams do.",
  },
  {
    name: "Rish Ambwani",
    handle: "@AmbwaniRishi",
    avatar: five,
    quote: "Built a whole startup with one prompt. You get multiple AI teammates working in sync 24/7. Unreal.",
  },
  {
    name: "RJ - Rishabh Jain",
    handle: "@rishsanjain",
    avatar: six,
    quote:
      "BREAKING: AgentFlow can replace not just humans but entire companies? The hype is real. The pipeline from requirements to product is tight.",
  },
  {
    name: "Christian Landgren",
    handle: "@Landgren",
    avatar: seven,
    quote:
      "Vi visade AgentFlow och tappade hakan. Agenterna tog jobb som annars skulle krävt timmar. Framtiden är här.",
  },
  {
    name: "Varun Mayya",
    handle: "@VarunMayya",
    avatar: eight,
    quote:
      "It felt like working with a real software team. Planner, Researcher, Dev, Tester, Reporter—each plays a role and ships.",
  },
  {
    name: "Michael Borman",
    handle: "@michaelborman",
    avatar: nine,
    quote: "Built a full project from one-line prompt in minutes. Multi-agent orchestration done right.",
  },
  {
    name: "Emma",
    handle: "@emma_codes",
    avatar: ten,
    quote: "The UX polish with meaningful defaults is superb. It’s not just output—it’s reasoning and collaboration.",
  },
  {
    name: "Akira",
    handle: "@akira_dev",
    avatar: eleven,
    quote: "要件整理からテスト、自動デプロイまで。AgentFlow は一連の流れをまとめて扱えるのが最高。",
  },
  {
    name: "Nina",
    handle: "@nina_builds",
    avatar: twelve,
    quote: "Cards are clean, copy is on point, and the results are useful. Would recommend for rapid prototyping.",
  },
]

export default function Community() {
  return (
    <section className="relative w-full py-24">
      {/* Background: checkerboard dots + vignette + glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Checkerboard dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(180,160,255,0.16) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.65) 60%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.65) 60%, transparent 85%)",
          }}
        />
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(95,77,255,0.25),transparent_70%)]" />
        {/* Ambient glow blobs */}
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(122,93,255,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-16 -right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(87,206,255,0.2),transparent_60%)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-pretty text-3xl font-semibold tracking-tight text-foreground/90 md:text-5xl">
            Hear From Our Community{" "}
            <span className="relative inline-block">
              Users
              {/* sticker */}
              <span className="ml-2 inline-flex -rotate-6 items-center rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs text-foreground/70 shadow-sm backdrop-blur-md">
                10000+
              </span>
              {/* underline scribble */}
              <svg
                className="pointer-events-none absolute -bottom-2 left-0 h-3 w-[110%]"
                viewBox="0 0 100 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C 20 2, 40 12, 60 4 S 95 8, 98 6"
                  stroke="rgba(148,115,255,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mt-3 text-balance text-sm text-foreground/60 md:text-base">
            Real notes from builders shipping with multi-agent orchestration.
          </p>
        </div>

        {/* Masonry-style columns */}
        <div className="columns-1 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {DUMMY_TESTIMONIALS.map((t, i) => (
            <article
              key={i}
              className="mb-6 break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition hover:shadow-[0_0_0_1px_rgba(148,115,255,0.35),0_0_30px_rgba(148,115,255,0.15)]"
            >
              {/* Top accent line */}
              <div className="mb-4 h-1.5 w-full rounded-full bg-gradient-to-r from-[rgba(148,115,255,0.45)] via-[rgba(115,195,255,0.35)] to-transparent" />
              {/* Header */}
              <header className="mb-3 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.05)] object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground/90">{t.name}</h3>
                    <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-foreground/60">
                      community
                    </span>
                  </div>
                  <p className="truncate text-xs text-foreground/50">{t.handle}</p>
                </div>
              </header>

              {/* Body */}
              <p className="whitespace-pre-line text-sm leading-6 text-foreground/80">{t.quote}</p>

              {/* Bottom chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-foreground/60">
                  #AgentFlow
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-foreground/60">
                  #MultiAgent
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-foreground/60">
                  #AI
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
