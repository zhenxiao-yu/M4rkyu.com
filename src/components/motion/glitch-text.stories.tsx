import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GlitchText } from "./glitch-text";

const meta = {
  title: "Motion/GlitchText",
  component: GlitchText,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GlitchText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Project Archive",
    className:
      "text-4xl font-[700] leading-[1.05] tracking-normal sm:text-5xl",
  },
};

export const LongerTitle: Story = {
  args: {
    children: "Software · Games · Digital Art",
    className: "text-3xl font-[700] leading-[1.05] tracking-normal",
  },
};

export const ShortToken: Story = {
  args: {
    children: "PORTAL",
    className:
      "font-display text-6xl font-[800] tracking-tight",
  },
};

// Set the OS to `prefers-reduced-motion: reduce` to see the
// short-circuit branch — the host renders as plain text with no
// pseudo-element decoration. There is no Storybook addon required;
// the JS short-circuit + the CSS @media wrapper both honor the
// system setting.
export const ReducedMotion: Story = {
  args: {
    children: "Reduced-motion fallback",
    className: "text-3xl font-[700]",
  },
};
