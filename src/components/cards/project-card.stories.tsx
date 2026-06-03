import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectCard } from "./project-card";
import { allProjects } from "@/content/projects";

// allProjects[0] is "ready" + featured with a live URL and source; the
// archived UE4 prototype exercises the "no live URL" footer + a
// different status dot.
const shipped = allProjects[0];
const archived =
  allProjects.find((project) => project.status === "archived") ?? shipped;

const meta = {
  title: "cards/ProjectCard",
  component: ProjectCard,
  args: {
    project: shipped,
    locale: "en",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Archived: Story = {
  args: { project: archived },
};

export const Highlighted: Story = {
  args: { highlighted: true },
};

export const ZhLocale: Story = {
  args: { locale: "zh" },
};
