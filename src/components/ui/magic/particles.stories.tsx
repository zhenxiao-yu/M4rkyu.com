import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Particles } from "./particles";

const meta = {
  title: "Magic UI/Particles",
  component: Particles,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Particles>;

export default meta;
type Story = StoryObj<typeof meta>;

function StageWrapper({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="relative h-[480px] w-full overflow-hidden border bg-background">
      {children}
      <div className="relative grid h-full place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <StageWrapper label="ambient drift — 32 particles">
      <Particles />
    </StageWrapper>
  ),
};

export const Dense: Story = {
  render: () => (
    <StageWrapper label="dense — 80 particles (use sparingly)">
      <Particles quantity={80} maxOpacity={0.4} />
    </StageWrapper>
  ),
};

export const Slow: Story = {
  render: () => (
    <StageWrapper label="slow drift">
      <Particles speed={0.04} />
    </StageWrapper>
  ),
};
