import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CommandHero } from "./command-hero";

/**
 * Note: `CommandHero` is an async server component that fetches the
 * latest dev.to post via `getPosts()`. Storybook's RSC mode is
 * required to render it; otherwise the story falls back to an
 * unresolved-promise placeholder. The visual coverage lives in the
 * home-page integration — these stories are mostly for prop typing
 * and the @storybook/nextjs-vite RSC pipeline.
 */
const meta = {
  title: "Sections/CommandHero",
  component: CommandHero,
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommandHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  args: {
    locale: "en",
  },
};

export const Chinese: Story = {
  args: {
    locale: "zh",
  },
};
