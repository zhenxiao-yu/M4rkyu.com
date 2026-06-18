/**
 * Editorial margins for wide screens.
 *
 * The site caps content at `max-w-7xl`; on displays wider than that the
 * leftover gutters read as dead space (and exposed the hero's atmospheric
 * bleed). This turns them into intentional editorial margin: a hairline rule
 * at each column edge plus a faint vertical mono folio running in the gutter.
 *
 * Decorative — `aria-hidden`, `pointer-events-none`, no motion. Fixed as a
 * running margin and gated to `2xl` (≥1536px), where the gutter is finally
 * wide enough to frame; below that it renders nothing. Sits behind content
 * (`-z-10`), so full-bleed sections (the hero masthead) cover it and only the
 * capped content body is framed. Tokens only.
 */
export function EditorialFrame() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden 2xl:block"
    >
      <div className="relative mx-auto h-full max-w-7xl border-x border-border/20">
        <span className="absolute right-full top-12 mr-6 rotate-180 font-mono text-[0.56rem] uppercase tracking-[0.45em] text-muted-foreground/35 [writing-mode:vertical-rl]">
          M4RKYU.SYS
        </span>
        <span className="absolute bottom-12 left-full ml-6 font-mono text-[0.56rem] uppercase tracking-[0.45em] text-muted-foreground/35 [writing-mode:vertical-rl]">
          Edition 2027
        </span>
      </div>
    </div>
  );
}
