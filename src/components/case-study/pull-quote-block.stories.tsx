import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PullQuoteBlock } from "./pull-quote-block";

const meta = {
  title: "case-study/PullQuoteBlock",
  component: PullQuoteBlock,
  args: {
    quote:
      "Authentication copy matters as much as authentication mechanics — readers feel the difference before they notice it.",
  },
} satisfies Meta<typeof PullQuoteBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "Outcome",
  },
};

export const WithAttribution: Story = {
  args: {
    eyebrow: "Lessons learned",
    attribution: "Nimbus case study, 2025",
  },
};
