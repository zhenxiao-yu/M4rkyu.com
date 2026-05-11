import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PixelTransitionOverlay } from "./pixel-transition-overlay";

const meta = {
  title: "ui/pixel/PixelTransitionOverlay",
  component: PixelTransitionOverlay,
  decorators: [
    (Story) => (
      // Constrains the fixed overlay to the story canvas so the
      // animation is observable in Storybook. In production the
      // component is fixed to the viewport.
      <div className="relative h-[20rem] w-full overflow-hidden border border-border bg-cyber-grid">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PixelTransitionOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DitherDown: Story = { args: { mode: "dither", duration: "medium" } };
export const WipeLeft: Story = { args: { mode: "wipe-l", duration: "medium" } };
export const WipeRight: Story = { args: { mode: "wipe-r", duration: "medium" } };
export const Slow: Story = { args: { mode: "dither", duration: "slow" } };
export const Cinematic: Story = { args: { mode: "dither", duration: "cinematic" } };
