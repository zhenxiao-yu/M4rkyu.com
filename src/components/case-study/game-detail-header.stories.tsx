// Visual approximation; the production component is async and reads getTranslations.
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import type { Game } from "@/content/schemas";

function GameDetailHeaderClone({ game }: { game: Game }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Link
          href="/games"
          className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← games
        </Link>
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{game.engine}</Badge>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {game.year}
          </span>
          {game.status !== "ready" ? <DraftBadge label={game.status} /> : null}
        </div>
        <h1 className="mt-6 max-w-5xl text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-tight">
          {game.title}
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
          {game.pitch}
        </p>
        <dl className="mt-10 grid gap-6 border-t pt-6 sm:grid-cols-[auto_1fr] sm:gap-x-10">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            Role
          </dt>
          <dd className="text-sm leading-7 text-foreground">{game.role}</dd>
          {game.platforms.length > 0 ? (
            <>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Platforms
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {game.platforms.map((item) => (
                  <Badge key={item} variant="outline" className="text-[0.65rem]">
                    {item}
                  </Badge>
                ))}
              </dd>
            </>
          ) : null}
          {game.buildLinks.length > 0 ? (
            <>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Links
              </dt>
              <dd className="flex flex-wrap gap-2">
                {game.buildLinks.map((link, index) => (
                  <Button
                    key={`${index}-${link.url}`}
                    asChild
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  </Button>
                ))}
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </section>
  );
}

const defaultGame: Game = {
  title: "Signal Drift",
  slug: "signal-drift",
  engine: "Unity",
  year: "2025",
  status: "draft",
  pitch:
    "A short atmospheric prototype exploring traversal, ambient signal cues, and minimal UI in a quiet cyber-grid.",
  role: "Solo design, programming, and audio direction.",
  notes: [],
  platforms: ["WebGL", "Windows"],
  pillars: [],
  buildLinks: [
    { label: "Play WebGL", url: "https://example.com/signal-drift/webgl" },
    { label: "Download Win", url: "https://example.com/signal-drift/win" },
  ],
};

const minimalGame: Game = {
  title: "Untitled prototype",
  slug: "untitled-prototype",
  engine: "Godot",
  year: "TBD",
  status: "placeholder",
  pitch: "Placeholder: replace with the final pitch once the prototype lands.",
  role: "TBD: scope and ownership pending.",
  notes: [],
  platforms: [],
  pillars: [],
  buildLinks: [],
};

const meta = {
  title: "case-study/GameDetailHeader",
  component: GameDetailHeaderClone,
} satisfies Meta<typeof GameDetailHeaderClone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { game: defaultGame } };
export const Minimal: Story = { args: { game: minimalGame } };
