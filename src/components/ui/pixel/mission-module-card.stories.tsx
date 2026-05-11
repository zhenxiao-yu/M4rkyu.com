import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MissionModuleCard } from "./mission-module-card";
import { allProjects } from "@/content/projects";

const sample = allProjects[0];

const meta = {
  title: "ui/pixel/MissionModuleCard",
  component: MissionModuleCard,
  args: {
    project: sample,
    locale: "en",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MissionModuleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Highlighted: Story = {
  args: { highlighted: true },
};

export const Compact: Story = {
  args: { compact: true },
};

export const ZhLocale: Story = {
  args: { locale: "zh" },
};
