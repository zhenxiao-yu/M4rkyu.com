import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BlurFade } from "./blur-fade";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BlurFadeStoryArgs {
  delay?: number;
}

function BlurFadeStory({ delay }: BlurFadeStoryArgs) {
  return (
    <BlurFade delay={delay} className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>BlurFade demo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          The wrapper fades and de-blurs once the element enters the viewport.
          Reload the story or scroll the canvas to retrigger the animation.
        </CardContent>
      </Card>
    </BlurFade>
  );
}

const meta = {
  title: "ui/magic/BlurFade",
  component: BlurFadeStory,
  parameters: {
    docs: {
      description: {
        component:
          "Honors prefers-reduced-motion via useReducedMotion() — short-circuits to a static div.",
      },
    },
  },
} satisfies Meta<typeof BlurFadeStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Delayed: Story = {
  args: { delay: 0.4 },
};
