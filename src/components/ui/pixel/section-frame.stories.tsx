import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionFrame } from "./section-frame";
import { Button } from "../button";

const meta = {
  title: "ui/pixel/SectionFrame",
  component: SectionFrame,
  args: {
    title: "Systems & surfaces",
  },
} satisfies Meta<typeof SectionFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIndexAndEyebrow: Story = {
  args: {
    index: "05",
    eyebrow: "selected · missions",
    title: "Featured mission modules",
    lede: "A small, curated archive of production interfaces, interactive systems, and visual experiments.",
  },
};

export const WithActions: Story = {
  args: {
    index: "01",
    eyebrow: "writing · logs",
    title: "Field notes",
    actions: (
      <Button variant="outline" size="sm">
        View all
      </Button>
    ),
  },
};

export const PanelFrame: Story = {
  args: {
    index: "02",
    eyebrow: "interface · systems",
    title: "Bordered section opener",
    lede: "Use frame=\"panel\" when the opener should sit on a bordered surface — game-lab subsections, contact CTA, etc.",
    frame: "panel",
  },
};
