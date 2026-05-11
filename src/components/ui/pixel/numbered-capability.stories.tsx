import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NumberedCapability } from "./numbered-capability";

const meta = {
  title: "ui/pixel/NumberedCapability",
  component: NumberedCapability,
  args: {
    index: "01",
    title: "Production engineering",
    description:
      "Shipping Next.js / TypeScript / CI / observability work — the slow, careful kind that survives the second year.",
  },
} satisfies Meta<typeof NumberedCapability>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTags: Story = {
  args: {
    tags: ["Next.js", "TypeScript", "CI", "Observability"],
  },
};

export const WithCta: Story = {
  args: {
    tags: ["Next.js", "TypeScript", "CI"],
    cta: { label: "Browse production work", href: "/projects" },
  },
};

export const WithVisual: Story = {
  args: {
    tags: ["Tailwind", "Tokens", "Motion"],
    visual: (
      <div className="aspect-[4/3] w-full rounded-sm border border-border bg-card placeholder-noise" />
    ),
  },
};

// Verifies the row renders cleanly with hand-written Chinese copy.
// `font-pixel` on the index is allowed because the index is ASCII
// digits — the :lang(zh) guard from Phase 1 only matters once
// font-pixel meets translated content.
export const ZhLocale: Story = {
  args: {
    index: "05",
    title: "视觉叙事",
    description:
      "摄影、影像、艺术指导、影像档案策展 —— 每一帧都值得留下。",
    tags: ["Photo", "Film", "Direction", "Curation"],
  },
};
