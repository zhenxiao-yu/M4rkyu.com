import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PointerSpotlight } from "./pointer-spotlight";

const meta = {
  title: "Magic UI/PointerSpotlight",
  component: PointerSpotlight,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PointerSpotlight>;

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
    <StageWrapper label="move cursor — soft cyan follows">
      <PointerSpotlight />
    </StageWrapper>
  ),
};

export const LowIntensity: Story = {
  render: () => (
    <StageWrapper label="quieter / 6% intensity">
      <PointerSpotlight intensity={0.06} />
    </StageWrapper>
  ),
};

export const HighIntensity: Story = {
  render: () => (
    <StageWrapper label="louder / 24% — overshoots the editorial brief, included only for reference">
      <PointerSpotlight intensity={0.24} />
    </StageWrapper>
  ),
};
