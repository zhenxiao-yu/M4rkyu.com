import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BorderBeam } from "./border-beam";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BorderBeamStoryArgs {
  duration?: number;
  delay?: number;
  borderRadius?: number;
}

function BorderBeamStory(args: BorderBeamStoryArgs) {
  return (
    <div className="relative mx-auto h-full max-w-sm">
      <BorderBeam {...args} />
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>BorderBeam demo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          A quiet light trace runs around the border. One per page only —
          the host sets a positioned wrapper; the beam fills the space
          via `pointer-events: none`.
        </CardContent>
      </Card>
    </div>
  );
}

const meta = {
  title: "ui/magic/BorderBeam",
  component: BorderBeamStory,
  parameters: {
    docs: {
      description: {
        component:
          "Honors prefers-reduced-motion via useReducedMotion() — returns null so the host card is identical to non-highlighted siblings.",
      },
    },
  },
} satisfies Meta<typeof BorderBeamStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { duration: 14, borderRadius: 8 },
};

export const Slow: Story = {
  args: { duration: 22, borderRadius: 8 },
};

export const Delayed: Story = {
  args: { duration: 14, delay: 1.2, borderRadius: 8 },
};
