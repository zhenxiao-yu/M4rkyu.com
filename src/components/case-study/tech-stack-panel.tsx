import { techIcon } from "@/lib/content/tech-icons";
import { cn } from "@/lib/utils";

interface StackGroup {
  group: string;
  items: string[];
}

interface TechStackPanelProps {
  /** Grouped stack (Frontend / Backend / …). Falls back to `stack`. */
  groups?: StackGroup[];
  /** Flat stack array — used when `groups` is empty. */
  stack: string[];
  className?: string;
}

const chipClass =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm leading-none text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50";

function TechChip({ name }: { name: string }) {
  const glyph = techIcon(name);
  return (
    <span className={chipClass}>
      {glyph ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        >
          <path d={glyph.path} fill="currentColor" />
        </svg>
      ) : null}
      {name}
    </span>
  );
}

/**
 * "Built with" panel for /work/[slug]. Renders the grouped stack when the
 * project provides `stackGroups`, otherwise a single flat chip cloud from
 * `stack`. Brand glyphs are monochrome (currentColor) so the page keeps a
 * single accent per the visual doctrine.
 */
export function TechStackPanel({ groups, stack, className }: TechStackPanelProps) {
  const hasGroups = Boolean(groups && groups.length > 0);

  if (hasGroups) {
    return (
      <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
        {groups!.map((group) => (
          <div key={group.group}>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {group.group}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item}>
                  <TechChip name={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (stack.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {stack.map((item) => (
        <li key={item}>
          <TechChip name={item} />
        </li>
      ))}
    </ul>
  );
}
