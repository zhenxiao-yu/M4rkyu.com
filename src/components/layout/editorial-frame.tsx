/**
 * Editorial margins for wide screens.
 *
 * The site caps content at `max-w-page`; on displays wider than that the
 * leftover gutters read as dead space (and exposed the hero's atmospheric
 * bleed). This turns them into intentional editorial margin: a hairline rule
 * at each column edge plus a faint vertical mono folio running in the gutter.
 *
 * Decorative — `aria-hidden`, `pointer-events-none`, no motion. Fixed as a
 * running margin and gated to `4xl` (≥2560px). `max-w-page` fills to ~88vw on
 * wide screens, so the side gutter stays small until true 4K territory; gating
 * at `4xl` is where the gutter is finally wide enough to seat the hairline rule
 * and vertical folio without clipping them off-screen. Sits behind content
 * (`-z-10`), so full-bleed sections (the hero masthead) cover it and only the
 * capped content body is framed. Tokens only.
 */
export function EditorialFrame() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden 4xl:block"
    >
      <div className="relative mx-auto h-full max-w-page border-x border-border/20">
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
