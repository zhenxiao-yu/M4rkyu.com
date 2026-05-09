import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageFade } from "./page-fade";

const meta = {
  title: "Motion/PageFade",
  component: PageFade,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageFade>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="mx-auto max-w-2xl space-y-4 p-12">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          page · /example
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          Cross-route fade preview
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          PageFade wraps page content with a 150ms opacity + 8px y-offset
          entry animation keyed by the current pathname. There is no exit
          animation; the App Router does not surface unmount cleanly without
          complex layout choreography. Reload the story to replay the entry.
        </p>
      </div>
    ),
  },
};
