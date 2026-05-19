import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShadowGenerator } from "./Tool";

const meta = {
  title: "tools/ShadowGenerator",
  component: ShadowGenerator,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ShadowGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
