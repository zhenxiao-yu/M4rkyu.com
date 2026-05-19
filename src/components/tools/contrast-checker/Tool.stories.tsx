import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContrastChecker } from "./Tool";

const meta = {
  title: "tools/ContrastChecker",
  component: ContrastChecker,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ContrastChecker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Defaults render a passing dark-on-light pair so first-paint shows
// every pass badge in its "green" state. Use the picker to drive the
// other variants — no extra args needed.
export const Default: Story = {};
