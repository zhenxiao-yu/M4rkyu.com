// Visual approximation; the production component is async and reads getTranslations.
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface AdjacentEntry {
  href: string;
  title: string;
  pitch: string;
}

interface FooterCloneProps {
  prev?: AdjacentEntry;
  next?: AdjacentEntry;
  archiveHref: string;
}

function CaseStudyFooterClone({ prev, next, archiveHref }: FooterCloneProps) {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <Adjacent entry={prev} direction="prev" label="Previous" />
          <div className="hidden lg:block lg:self-center">
            <Button asChild variant="outline">
              <Link href={archiveHref}>Back to archive</Link>
            </Button>
          </div>
          <Adjacent entry={next} direction="next" label="Next" />
        </div>
        <div className="mt-8 flex justify-center lg:hidden">
          <Button asChild variant="outline">
            <Link href={archiveHref}>Back to archive</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}

function Adjacent({
  entry,
  direction,
  label,
}: {
  entry: AdjacentEntry | undefined;
  direction: "prev" | "next";
  label: string;
}) {
  if (!entry) {
    return <div className="hidden lg:block" aria-hidden="true" />;
  }
  const isNext = direction === "next";
  return (
    <Link
      href={entry.href}
      className={`group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isNext ? "lg:text-right" : ""
      }`}
    >
      <span
        className={`flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground ${
          isNext ? "lg:justify-end" : ""
        }`}
      >
        {!isNext ? <ArrowLeft aria-hidden="true" className="size-3" /> : null}
        {label}
        {isNext ? <ArrowRight aria-hidden="true" className="size-3" /> : null}
      </span>
      <span className="text-lg font-semibold leading-snug">{entry.title}</span>
      <span className="line-clamp-2 text-sm leading-6 text-muted-foreground">
        {entry.pitch}
      </span>
    </Link>
  );
}

const prevEntry: AdjacentEntry = {
  href: "/projects/nimbus",
  title: "Nimbus",
  pitch:
    "A secure file management platform shaped around calm organization, OTP access, and storage analytics.",
};

const nextEntry: AdjacentEntry = {
  href: "/projects/m4rketview",
  title: "M4rketView",
  pitch:
    "A cryptocurrency screener built for quick scanning, watchlist thinking, and market table clarity.",
};

const meta = {
  title: "case-study/CaseStudyFooter",
  component: CaseStudyFooterClone,
} satisfies Meta<typeof CaseStudyFooterClone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BothSides: Story = {
  args: { prev: prevEntry, next: nextEntry, archiveHref: "/projects" },
};

export const OnlyPrev: Story = {
  args: { prev: prevEntry, next: undefined, archiveHref: "/projects" },
};

export const OnlyNext: Story = {
  args: { prev: undefined, next: nextEntry, archiveHref: "/projects" },
};
