import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BentoCard, BentoGrid } from "./bento-grid";

function BentoGridStory({ count }: { count: number }) {
  return (
    <BentoGrid className="max-w-5xl">
      {Array.from({ length: count }).map((_, index) => (
        <BentoCard key={index} className="p-5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            Cell {String(index + 1).padStart(2, "0")}
          </span>
          <p className="mt-3 text-sm leading-6 text-foreground">
            Bento cell — owns its own padding. Border, surface, and hover
            transition come from the primitive.
          </p>
        </BentoCard>
      ))}
    </BentoGrid>
  );
}

function BentoMixedStory() {
  return (
    <BentoGrid className="max-w-5xl auto-rows-[10rem]">
      <BentoCard span="sm:row-span-2" className="p-5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          Tall cell
        </span>
        <p className="mt-3 text-sm leading-6 text-foreground">
          Spans two rows on `sm+` to anchor the layout.
        </p>
      </BentoCard>
      <BentoCard className="p-5">
        <p className="text-sm leading-6 text-foreground">Wide.</p>
      </BentoCard>
      <BentoCard className="p-5">
        <p className="text-sm leading-6 text-foreground">Compact.</p>
      </BentoCard>
      <BentoCard className="p-5">
        <p className="text-sm leading-6 text-foreground">Compact.</p>
      </BentoCard>
    </BentoGrid>
  );
}

const meta = {
  title: "ui/magic/BentoGrid",
  component: BentoGridStory,
} satisfies Meta<typeof BentoGridStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourCells: Story = { args: { count: 4 } };
export const SixCells: Story = { args: { count: 6 } };

export const MixedAspects: StoryObj = {
  render: () => <BentoMixedStory />,
};
