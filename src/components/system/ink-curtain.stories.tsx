import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InkCurtain } from "./ink-curtain";
import { playInkWipe } from "@/lib/route-transition";

/**
 * The page-transition ink sweep, driven by its real `route-transition` store.
 * `Run the ink sweep` fires `playInkWipe`, which runs the true
 * cover → (route swap) → reveal → idle timeline. At rest the fake masthead in
 * the top-left stays fully visible — proving the curtain parks off-screen and
 * no longer bleeds a glow ribbon over it. Switch theme + the
 * mobile360/desktop1440 viewports to check the curve pacing.
 */
const meta = {
  title: "System/InkCurtain",
  component: InkCurtain,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InkCurtain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Play: Story = {
  render: () => (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Fake masthead pinned to the left edge — the surface the old curtain's
       * box-shadow glow used to cover. It must stay crisp at idle. */}
      <div className="absolute left-4 top-4 z-10 font-mono text-xs uppercase tracking-[0.24em] text-foreground">
        M4RKYU.SYS
      </div>

      <div className="grid min-h-dvh place-items-center">
        <button
          type="button"
          onClick={() => playInkWipe(() => {})}
          className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring hover:text-ring"
        >
          Run the ink sweep →
        </button>
      </div>

      <InkCurtain />
    </div>
  ),
};
