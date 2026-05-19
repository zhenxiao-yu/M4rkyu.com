import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface ClosingCTAStripProps {
  statement: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href?: string; mailto?: string };
}

export function ClosingCTAStrip({
  statement,
  primary,
  secondary,
}: ClosingCTAStripProps) {
  return (
    <section className="relative overflow-hidden border-t bg-muted/30 py-20 sm:py-24">
      <div aria-hidden="true" className="absolute inset-0 bg-cyber-grid opacity-25" />
      <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-balance text-2xl font-semibold leading-tight font-display sm:text-3xl lg:text-4xl">
          {statement}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? <SecondaryCTA secondary={secondary} /> : null}
        </div>
      </div>
    </section>
  );
}

function SecondaryCTA({
  secondary,
}: {
  secondary: NonNullable<ClosingCTAStripProps["secondary"]>;
}) {
  if (secondary.mailto) {
    return (
      <Button asChild size="lg" variant="outline">
        <a href={`mailto:${secondary.mailto}`}>
          <Mail aria-hidden="true" className="size-4" />
          {secondary.label}
        </a>
      </Button>
    );
  }
  if (secondary.href) {
    return (
      <Button asChild size="lg" variant="outline">
        <Link href={secondary.href}>{secondary.label}</Link>
      </Button>
    );
  }
  return null;
}
