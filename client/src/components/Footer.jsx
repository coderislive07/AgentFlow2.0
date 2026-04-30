import Link from "next/link"
import logo from '../../public/logo.png'
import Image from "next/image"    

export default function Footer() {
  const year = new Date().getFullYear()

  const columns = [
    {
      title: "Product",
      links: [
        { label: "AgentFlow", href: "#" },
        { label: "Agents", href: "#" },
        { label: "Tasks", href: "#" },
        { label: "Orchestrator", href: "#" },
        { label: "Memory", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "#" },
        { label: "Playground", href: "#" },
        { label: "Community", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
        { label: "DPA", href: "#" },
        { label: "Cookies", href: "#" },
      ],
    },
  ]

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/50 bg-background">
      {/* checkerboard micro-grid background using currentColor */}
   <div
  aria-hidden
  className="pointer-events-none absolute inset-0 opacity-[0.15]"
  style={{
    backgroundImage:
      "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)," +
      "linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
  }}
/>

      {/* soft radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-[color:var(--color-chart-4)]/20 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        {/* CTA panel */}
        <div className="mx-auto mb-12 w-full rounded-xl border border-border/60 bg-secondary/20 p-6 backdrop-blur-md md:flex md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-pretty text-2xl font-semibold tracking-tight">Ready to orchestrate your agents?</h3>
            <p className="mt-2 text-muted-foreground">
              Automate with Planner, Researcher, Developer, Tester, and Reporter working in sync.
            </p>
          </div>
     
        </div>

        {/* link columns */}
        <div className="grid grid-cols-2 gap-8 border-b border-border/60 pb-10 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-foreground/90 transition hover:text-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 py-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="AgentFlow" className="h-6 w-6 opacity-90" />
            <span className="text-sm text-muted-foreground">© {year} AgentFlow. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              aria-label="X"
              href="#"
              className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary/30 hover:text-foreground"
            >
              {/* X icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                <path d="M18.244 3H21l-6.52 7.46L22 21h-6.03l-4.71-5.76L5.85 21H3.09l6.98-7.98L2 3h6.12l4.3 5.31L18.24 3Z" />
              </svg>
            </Link>
            <Link
              aria-label="GitHub"
              href="#"
              className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary/30 hover:text-foreground"
            >
              {/* GitHub icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.78-1.34-1.78-1.09-.75.08-.74.08-.74 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.48-1.34-5.48-5.97 0-1.32.47-2.39 1.24-3.24-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.31 1.23a11.5 11.5 0 0 1 6.02 0C17.23 3.6 18.24 3.92 18.24 3.92c.66 1.65.24 2.87.12 3.17.77.85 1.24 1.92 1.24 3.24 0 4.64-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0 0 12 .5Z" />
              </svg>
            </Link>
            <Link
              aria-label="Discord"
              href="#"
              className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary/30 hover:text-foreground"
            >
              {/* Discord icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                <path d="M20.317 4.369A19.791 19.791 0 0 0 16.887 3a14.66 14.66 0 0 0-.719 1.5 18.212 18.212 0 0 0-4.336 0A13.483 13.483 0 0 0 11.113 3a19.736 19.736 0 0 0-3.43 1.369C4.758 7.164 4.09 9.86 4.28 12.516c1.43 1.06 2.815 1.706 4.156 2.156a10.6 10.6 0 0 0 .719-1.377 8.9 8.9 0 0 1-1.13-.552c.093-.068.185-.138.275-.21a12.67 12.67 0 0 0 7.5 0c.09.072.182.142.275.21-.358.212-.733.4-1.13.552.2.486.441.944.719 1.376 1.341-.449 2.726-1.096 4.156-2.155.34-4.51-.579-7.174-2.999-9.147ZM9.861 12.68c-.73 0-1.33-.67-1.33-1.5 0-.83.593-1.5 1.33-1.5.738 0 1.338.67 1.33 1.5 0 .83-.593 1.5-1.33 1.5Zm4.278 0c-.73 0-1.33-.67-1.33-1.5 0-.83.593-1.5 1.33-1.5.738 0 1.33.67 1.33 1.5 0 .83-.593 1.5-1.33 1.5Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
