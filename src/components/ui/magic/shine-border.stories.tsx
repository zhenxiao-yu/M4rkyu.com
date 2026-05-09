import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShineBorder } from "./shine-border";

const meta = {
  title: "Magic UI/ShineBorder",
  component: ShineBorder,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ShineBorder>;

export default meta;
type Story = StoryObj<typeof meta>;

function CardStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-80 overflow-hidden rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      {children}
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        sample
      </p>
      <h3 className="mt-2 text-lg font-semibold leading-snug">
        Quiet attention pull
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        ShineBorder draws a slow conic-gradient sweep around the parent
        border. Use sparingly — at most one in view at a time.
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <CardStage>
      <ShineBorder borderRadius={8} />
    </CardStage>
  ),
};

export const Slow: Story = {
  render: () => (
    <CardStage>
      <ShineBorder borderRadius={8} duration={28} />
    </CardStage>
  ),
};

export const ThickStroke: Story = {
  render: () => (
    <CardStage>
      <ShineBorder borderRadius={8} borderWidth={2} duration={18} />
    </CardStage>
  ),
};
