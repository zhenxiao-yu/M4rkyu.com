import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClosingCTAStrip } from "./closing-cta-strip";

const meta = {
  title: "sections/ClosingCTAStrip",
  component: ClosingCTAStrip,
  args: {
    statement:
      "Looking for an engineer who treats portfolio surfaces like product surfaces.",
    primary: { label: "View projects", href: "/projects" },
  },
} satisfies Meta<typeof ClosingCTAStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMailto: Story = {
  args: {
    secondary: { label: "Email me", mailto: "hello@example.com" },
  },
};

export const WithSecondaryHref: Story = {
  args: {
    secondary: { label: "Visit portal", href: "/portal" },
  },
};
