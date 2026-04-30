"use client"
import code from '../../../public/code.svg'
import { useEffect, useMemo, useRef, useState } from "react"


const AGENTS = [
  { name: "Planner", color: "var(--chart-4)" },
  { name: "Researcher", color: "var(--chart-2)" },
  { name: "Developer", color: "var(--chart-3)" },
  { name: "Memory", color: "var(--chart-5)" },
  { name: "Tester", color: "var(--chart-1)" },
  { name: "Reporter", color: "var(--chart-2)" },
  { name: "Orchestrator", color: "var(--chart-4)" },
]

// Wave control points in viewBox space (0..100, 0..100)
function buildPath() {
  // S-curve like the reference, rising overall to the right
  return [
    "M 0 70",
    "C 8 60, 12 50, 18 52",
    "S 30 65, 38 62",
    "S 50 48, 58 50",
    "S 70 66, 76 58",
    "S 88 42, 94 45",
    "S 100 30, 100 30",
  ].join(" ")
}

export default function Hero() {
  const pathRef = useRef(null)
  const [positions, setPositions] = useState([])
  const [hoverIndex, setHoverIndex] = useState(-1)

  const d = useMemo(() => buildPath(), [])
  const nodeTs = useMemo(() => [0.05, 0.18, 0.33, 0.5, 0.64, 0.8, 0.94], [])

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()
    const pts = nodeTs.map((t) => path.getPointAtLength(len * t))
    setPositions(pts)
  }, [d, nodeTs])

  return (
    <section className="relative overflow-hidden">
      {/* Background: deep radial + subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 70% 30%, rgba(99,102,241,0.18), rgba(0,0,0,0))," +
            "radial-gradient(900px 500px at 40% 60%, rgba(56,189,248,0.12), rgba(0,0,0,0))," +
            "linear-gradient(180deg, rgba(6,8,18,0.85), rgba(6,8,18,0.85))",
          maskImage: "radial-gradient(1200px 600px at 70% 30%, rgba(0,0,0,0.85), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Copy */}
          <div className="space-y-6">
            <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[color:var(--chart-4)] to-[color:var(--chart-2)]">
                Providing the First
              </span>
              <br />
              Multi‑Agent Automation System
            </h1>
            <p className="text-pretty text-base sm:text-lg text-foreground/80">
              Towards natural‑language orchestration. Specialized agents collaborate to plan, research, develop, test,
              and report — turning ideas into production‑ready outcomes.
            </p>
     
          </div>

          {/* Graph */}
<div
  className="relative bg-center "
  style={{ backgroundImage: `url(${code.src})` }}
>

            <svg viewBox="0 0 100 100" className="w-full h-[360px] md:h-[420px]">
              <defs>
                {/* Glow filter for path and nodes */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Animated gradient stroke */}
                <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--chart-3)" />
                  <stop offset="50%" stopColor="var(--chart-2)" />
                  <stop offset="100%" stopColor="var(--chart-4)" />
                </linearGradient>
              </defs>

              {/* Base faint path */}
              <path d={d} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />

              {/* Animated glowing segment moving from start to end */}
              <path
                d={d}
                ref={pathRef}
                stroke="url(#strokeGradient)"
                strokeWidth="2.6"
                fill="none"
                filter="url(#glow)"
                style={{
                  strokeLinecap: "round",
                  strokeDasharray: 14,
                  animation: "dashflow 4.5s linear infinite",
                }}
              />

              {/* Agent nodes (SVG circles) */}
              {positions.map((pt, idx) => {
                const isHover = hoverIndex === idx
                const r = isHover ? 5.4 : 4.7 // bigger balls
                const stroke = "rgba(255,255,255,0.35)"
                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={r}
                      fill={AGENTS[idx % AGENTS.length].color}
                      stroke={stroke}
                      strokeWidth="0.6"
                      filter="url(#glow)"
                      style={{
                        transition: "r 200ms ease, filter 200ms ease",
                      }}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(-1)}
                    />
                  </g>
                )
              })}
            </svg>

            {/* Labels positioned absolutely near nodes */}
            <div className="pointer-events-none absolute inset-0">
              {positions.map((pt, idx) => {
                const name = AGENTS[idx % AGENTS.length].name
                const left = `${pt.x}%`
                const top = `${pt.y}%`
                const isHover = hoverIndex === idx
                return (
                  <div
                    key={name + idx}
                    className="absolute translate-x-[-50%] -translate-y-[180%]"
                    style={{ left, top }}
                  >
                    <span
                      className={`pointer-events-auto inline-block rounded-full border px-2.5 py-1 text-xs
                                  backdrop-blur-sm
                                  ${isHover ? "border-[color:var(--chart-2)] text-foreground" : "border-border text-foreground/80"}
                                  bg-[color:var(--secondary)]/50`}
                    >
                      {name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Local styles for animation */}
      <style jsx>{`
        @keyframes dashflow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -28;
          }
        }
      `}</style>
    </section>
  )
}
