import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-mono text-foreground">M4rkyu.com / 2027 remake</p>
          <p className="mt-2 max-w-2xl">
            Black-and-white cyber-art portfolio system for {profile.name}. Built as an isolated
            Next.js migration; legacy production remains untouched.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          <a href={`mailto:${profile.email}`} className="hover:text-foreground">
            Email
          </a>
          <a href="https://github.com/zhenxiao-yu" className="hover:text-foreground">
            GitHub
          </a>
          <Link href="/projects" locale={locale} className="hover:text-foreground">
            Archive
          </Link>
          <Link href="/games" locale={locale} className="hover:text-foreground">
            Games
          </Link>
          <Link href="/media" locale={locale} className="hover:text-foreground">
            Media
          </Link>
        </div>
      </div>
    </footer>
  );
}
