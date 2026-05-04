import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function Tokens() {
  const swatches = ["background", "foreground", "card", "muted", "accent", "ring", "signal"];
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl font-semibold">M4rkyu Design Tokens</h1>
        <p className="mt-2 text-muted-foreground">Dark, light, and monochrome theme variables.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {swatches.map((name) => (
          <div key={name} className="rounded-lg border bg-card p-4">
            <div
              className="h-16 rounded-md border"
              style={{ background: `var(--${name})` }}
            />
            <p className="mt-3 font-mono text-xs">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "foundations/Tokens",
  component: Tokens,
} satisfies Meta<typeof Tokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
