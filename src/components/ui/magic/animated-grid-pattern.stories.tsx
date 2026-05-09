import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AnimatedGridPattern } from "./animated-grid-pattern";

function AnimatedGridPatternStory(args: {
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
}) {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-md border bg-background">
      <AnimatedGridPattern
        numSquares={args.numSquares}
        maxOpacity={args.maxOpacity}
        duration={args.duration}
        className="text-foreground/40"
      />
      <div className="relative grid h-full place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Hover-friendly demo surface
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "ui/magic/AnimatedGridPattern",
  component: AnimatedGridPatternStory,
  parameters: {
    docs: {
      description: {
        component:
          "Honors prefers-reduced-motion via useReducedMotion() — short-circuits to a fixed-opacity grid with a small subset of cells highlighted statically.",
      },
    },
  },
} satisfies Meta<typeof AnimatedGridPatternStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { numSquares: 28, maxOpacity: 0.18, duration: 5 },
};

export const Dense: Story = {
  args: { numSquares: 60, maxOpacity: 0.25, duration: 4 },
};

export const Quiet: Story = {
  args: { numSquares: 16, maxOpacity: 0.12, duration: 6 },
};
