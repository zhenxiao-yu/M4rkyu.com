import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PixelButton } from "./pixel-button";

const meta = {
  title: "ui/pixel/PixelButton",
  component: PixelButton,
  args: {
    children: "Browse the work",
  },
} satisfies Meta<typeof PixelButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Caret: Story = {
  args: { glyph: "caret" },
};

export const Play: Story = {
  args: { glyph: "play", variant: "secondary" },
};

export const Send: Story = {
  args: { glyph: "send", variant: "outline", children: "Open a channel" },
};

export const Ghost: Story = {
  args: { glyph: "caret", variant: "ghost", children: "Read the logs" },
};

export const Link: Story = {
  args: { glyph: "caret", variant: "link", children: "View résumé" },
};

export const Disabled: Story = {
  args: { glyph: "caret", disabled: true },
};

// Covers the `href` link mode used by the homepage hero CTAs —
// PixelButton renders an internal next-intl <Link> and nests
// glyph + label inside it, avoiding the RSC server→client boundary
// issue that the prior `asChild + cloneElement` path hit.
export const AsLink: Story = {
  args: {
    glyph: "caret",
    href: "/projects",
    children: "Browse the work",
  },
};
