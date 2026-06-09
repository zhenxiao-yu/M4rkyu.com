/**
 * RisographMarks — press-proof chrome for the Risograph flagship theme.
 *
 * A printer's registration target + the spot-ink colour bar + a proof label,
 * the way a two-colour riso sheet carries its calibration marks down the
 * edge. Purely decorative (`aria-hidden`) and gated to
 * `[data-palette="risograph"]` via the `.riso-print-marks` class in
 * globals.css, so every other theme renders nothing. Inks read straight from
 * the live tokens (`--ring` / `--ring-2` / `--ring-3` + ink), so the bar is
 * always an honest swatch of the active theme.
 *
 * Composed into PageHero, bottom-right — balancing the oversized folio word
 * that bleeds off the bottom-left, so the header reads as a registered sheet.
 */
export function RisographMarks() {
  return (
    <div
      aria-hidden="true"
      className="riso-print-marks pointer-events-none absolute bottom-5 right-4 z-[1] flex-col items-end gap-2 lg:right-6"
    >
      <RegistrationTarget className="size-5 text-foreground/45" />

      {/* Spot-ink calibration bar — the active theme's ink trio + black. */}
      <div className="flex h-1.5 w-20 overflow-hidden rounded-[1px] shadow-[0_0_0_1px_var(--border)]">
        <span className="flex-1" style={{ backgroundColor: "var(--ring)" }} />
        <span className="flex-1" style={{ backgroundColor: "var(--ring-2)" }} />
        <span className="flex-1" style={{ backgroundColor: "var(--ring-3)" }} />
        <span
          className="flex-1"
          style={{ backgroundColor: "var(--foreground)" }}
        />
      </div>

      <span className="font-mono text-[0.5rem] uppercase leading-none tracking-[0.22em] text-muted-foreground">
        2-Colour · Riso Proof
      </span>
    </div>
  );
}

/** Classic circle-and-crosshair printer's registration mark. The crosshair
 * over-runs the ring on every side, as on a real proof sheet. */
function RegistrationTarget({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" />
      <path
        d="M12 0v24M0 12h24"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="6 6"
      />
    </svg>
  );
}
