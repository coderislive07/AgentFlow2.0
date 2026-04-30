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
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src = {logo} alt="AgentFlow Logo" className="h-8 w-8"/>
            <span className="text-lg font-semibold tracking-wide">AgentFlow</span>
          </Link>

          {/* Center: Links */}
          <ul className="hidden md:flex items-center font-semibold gap-2">
            {links.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="rounded-full px-3  py-1.5 text-sm text-foreground/90 hover:text-foreground transition-colors
                             border border-transparent hover:border-border/60
                             hover:bg-[color:var(--secondary)]/40"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: CTA */}
        <div className="flex items-center gap-3">
<Link
  href="/get-started"
  className="relative px-6 py-2 text-sm font-semibold text-white
             bg-blue-500/20 backdrop-blur-lg backdrop-saturate-150
             border border-white/20
             shadow-[0_0_20px_rgba(56,189,248,0.3
             hover:shadow-[0_0_12px_rgba(56,189,248,0.5)] 
             transition-ease-in-out duration-200
             rounded-full"
>
  Try our products →
</Link>


</div>

        </nav>
      </div>
    </header>
  )
}
