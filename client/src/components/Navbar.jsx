"use client"
import Link from "next/link"
import logo from '../../public/logo.png'
import Image from "next/image"

const links = [
  { label: "OpsRoom", href: "/opsRoom" },
  { label: "Agents", href: "/agents" },
  { label: "Tasks", href: "/tasks" },
  { label: "Orchestrator", href: "/orchestrator" },
  { label: "Memory", href: "/memory" },
  { label: "Analytics", href: "/analytics" },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="AgentFlow Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-wide">AgentFlow</span>
        </Link>

        <ul className="hidden md:flex items-center font-semibold gap-2">
          {links.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-foreground/90 transition-colors border border-transparent hover:border-border/60 hover:bg-[color:var(--secondary)]/40 hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/get-started"
            className="rounded-full border border-white/20 bg-blue-500/20 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(56,189,248,0.18)] transition duration-200 hover:bg-blue-500/30 hover:shadow-[0_0_12px_rgba(56,189,248,0.4)]"
          >
            Try our products →
          </Link>
        </div>
      </div>
    </header>
  )
}
