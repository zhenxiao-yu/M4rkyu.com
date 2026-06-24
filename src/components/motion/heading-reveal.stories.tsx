import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeadingReveal } from "./heading-reveal";

const H1 =
  "mt-4 text-[2.6rem] font-[700] leading-[0.98] tracking-[-0.02em] text-balance sm:text-6xl lg:text-7xl";
const H2 =
  "mt-3 text-3xl font-[700] leading-[1.02] tracking-[-0.015em] text-balance sm:text-4xl lg:text-5xl";

const meta = {
  title: "Motion/HeadingReveal",
  component: HeadingReveal,
  parameters: { layout: "padded" },
} satisfies Meta<typeof HeadingReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

// The hero signature: eyebrow rule wipes in, the title fires its single-shot
// RGB glitch, the description blur-fades up after.
export const HeroGlitch: Story = {
  args: {
    as: "h1",
    variant: "glitch",
    overprint: true,
    eyebrow: "Selected Work",
    title: "Things I have made",
    description:
      "Software, games, and digital art — the projects worth keeping around.",
    titleClassName: H1,
  },
};

// The section default: every word rises and de-blurs into place on scroll-in.
export const EditorialWordReveal: Story = {
  args: {
    as: "h2",
    variant: "editorial",
    eyebrow: "Featured Frames",
    title: "Frames worth a second look",
    description: "A rotating cut from the wider archive.",
    titleClassName: H2,
  },
};

// A long title — the per-word stagger caps so it still resolves promptly.
export const LongTitle: Story = {
  args: {
    as: "h2",
    variant: "editorial",
    eyebrow: "Colophon",
    title: "How this site is designed, built, and shipped",
    titleClassName: H2,
  },
};

// No eyebrow, no description — just the title reveal.
export const TitleOnly: Story = {
  args: {
    as: "h2",
    variant: "editorial",
    title: "Quiet by default",
    titleClassName: H2,
  },
};

// Set the OS to `prefers-reduced-motion: reduce` to see the short-circuit:
// the final composition renders with no transforms and no glitch.
export const ReducedMotion: Story = {
  args: {
    as: "h1",
    eyebrow: "Reduced Motion",
    title: "Everything lands instantly",
    description: "Same composition, no animation.",
    titleClassName: H1,
  },
};
