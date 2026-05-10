import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PixelPanel } from "./pixel-panel";

const meta = {
  title: "ui/pixel/PixelPanel",
  component: PixelPanel,
  args: {
    children:
      "Premium cyber-pixel surface for HUD chips, terminal previews, and mission content.",
  },
} satisfies Meta<typeof PixelPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    eyebrow: "system · status",
    title: "M4RKYU.SYS",
  },
};

export const InkTone: Story = {
  args: {
    eyebrow: "ink · panel",
    title: "Inverted surface",
    tone: "ink",
  },
};

export const WithNotch: Story = {
  args: {
    eyebrow: "notched · corner",
    title: "Cartridge corner",
    notch: true,
  },
};
