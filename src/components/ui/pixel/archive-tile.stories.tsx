import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArchiveTile } from "./archive-tile";
import { galleryItems } from "@/content/gallery";

const sample = galleryItems[0];

const meta = {
  title: "ui/pixel/ArchiveTile",
  component: ArchiveTile,
  args: {
    item: sample,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArchiveTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Square: Story = { args: { aspect: "1/1" } };
export const Wide: Story = { args: { aspect: "3/2" } };
export const Cinematic: Story = { args: { aspect: "16/9" } };

// Tile with no `src` — exercises the cyber-grid loading background +
// PlaceholderImage fallback. Same path used for `coming-soon` frames.
export const NoCover: Story = {
  args: {
    item: { ...sample, src: undefined },
  },
};
