import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusPulse } from "./status-pulse";

const meta = {
  title: "ui/pixel/StatusPulse",
  component: StatusPulse,
  decorators: [
    (Story) => (
      <div className="flex h-16 items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusPulse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = { args: { tone: "live" } };
export const Now: Story = { args: { tone: "now" } };
export const Info: Story = { args: { tone: "info" } };

export const LiveLarge: Story = { args: { tone: "live", size: "md" } };
export const NowLarge: Story = { args: { tone: "now", size: "md" } };
