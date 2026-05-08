import { Code2, Mail } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { profile } from "@/content/profile"

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto]">
          {/* brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-md border bg-foreground text-background text-xs font-bold tracking-tight">
                M4
              </span>
              <span className="font-mono text-sm font-semibold tracking-wide">M4rkyu.com</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Software engineer, game developer, digital artist. Building at the intersection of
              precision and creativity.
            </p>
          </div>

          {/* work */}
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              Work
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              {[
                { label: "Projects", href: "/projects" },
                { label: "Games", href: "/games" },
                { label: "Gallery", href: "/gallery" },
                { label: "Writing", href: "/blog" },
                { label: "Resources", href: "/resources" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* connect */}
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              Connect
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/zhenxiao-yu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Code2 className="size-3.5" aria-hidden="true" />
                  GitHub
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  locale={locale}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  locale={locale}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {profile.name} — M4rkyu.com
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Built with Next.js 15 · {profile.location}
          </p>
        </div>
      </div>
    </footer>
  )
}
