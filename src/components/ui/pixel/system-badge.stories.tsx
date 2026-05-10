import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SystemBadge } from "./system-badge";

const meta = {
  title: "ui/pixel/SystemBadge",
  component: SystemBadge,
} satisfies Meta<typeof SystemBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = { args: { status: "ready" } };
export const Draft: Story = { args: { status: "draft" } };
export const Placeholder: Story = { args: { status: "placeholder" } };
export const ComingSoon: Story = { args: { status: "coming-soon" } };

export const Live: Story = { args: { kind: "live" } };
export const Now: Story = { args: { kind: "now" } };
export const Wip: Story = { args: { kind: "wip" } };
export const Archive: Story = { args: { kind: "archive" } };
export const Info: Story = { args: { kind: "info" } };

export const CustomLabel: Story = {
  args: { kind: "info", label: "v2027" },
};
