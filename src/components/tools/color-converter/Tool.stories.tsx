import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ColorConverter } from "./Tool";

const meta = {
  title: "tools/ColorConverter",
  component: ColorConverter,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ColorConverter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
