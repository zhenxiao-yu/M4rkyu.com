import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>One-line tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const RichContent: Story = {
  render: () => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Rich tooltip</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs px-3 py-2">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
            metadata
          </p>
          <p className="mt-1 text-sm font-semibold">Headline</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Two-line lede that explains what the trigger represents in
            slightly more detail.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
