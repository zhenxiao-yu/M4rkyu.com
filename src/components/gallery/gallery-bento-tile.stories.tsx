import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BentoGrid } from "@/components/ui/magic/bento-grid";
import { GalleryBentoTile } from "./gallery-bento-tile";
import { galleryItems } from "@/content/gallery";
import type { GalleryItem } from "@/content/schemas";

const placeholderItem = galleryItems[0];

const readyItem: GalleryItem = {
  ...placeholderItem,
  slug: "story-ready-frame",
  title: "Story-only ready frame",
  status: "ready",
  src: { src: "/gallery/black-white.svg", alt: "Black and white study" },
  caption: "Story-only frame; production renders the placeholder when src is missing.",
  type: "image",
};

function GalleryBentoTileStory({ item }: { item: GalleryItem }) {
  return (
    <BentoGrid className="max-w-3xl auto-rows-[16rem]">
      <GalleryBentoTile item={item} />
    </BentoGrid>
  );
}

const meta = {
  title: "gallery/GalleryBentoTile",
  component: GalleryBentoTileStory,
} satisfies Meta<typeof GalleryBentoTileStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = { args: { item: placeholderItem } };
export const WithImage: Story = { args: { item: readyItem } };
