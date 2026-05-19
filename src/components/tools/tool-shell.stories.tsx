import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToolShell } from "./tool-shell";

const meta = {
  title: "tools/ToolShell",
  component: ToolShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ToolShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Contrast Checker",
    description:
      "Paste two colors and the tool will compute the WCAG contrast ratio and surface pass / fail badges for normal and large text.",
    category: "Tool",
    tags: ["a11y", "color", "wcag"],
    children: (
      <div className="grid place-items-center rounded-md border border-dashed border-border bg-muted/30 py-12 text-sm text-muted-foreground">
        Tool surface mounts here
      </div>
    ),
  },
};

export const WithoutCategoryOrTags: Story = {
  args: {
    title: "Shadow Generator",
    description: "Build a CSS box-shadow with live preview.",
    children: (
      <div className="h-40 rounded-md border border-dashed border-border bg-muted/30" />
    ),
  },
};
