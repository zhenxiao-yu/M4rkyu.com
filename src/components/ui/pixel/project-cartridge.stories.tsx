import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectCartridge } from "./project-cartridge";
import { allProjects } from "@/content/projects";
import { localize } from "@/lib/content/localize";

const sample = allProjects[0];
const localized = localize(sample, "en");

const meta = {
  title: "ui/pixel/ProjectCartridge",
  component: ProjectCartridge,
  args: {
    project: sample,
    locale: "en",
    title: localized.title as string,
    shortPitch: localized.shortPitch as string,
    role: localized.role as string,
  },
} satisfies Meta<typeof ProjectCartridge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Featured: Story = {
  args: {
    project: { ...sample, featured: true },
  },
};

export const Draft: Story = {
  args: {
    project: { ...sample, contentStatus: "draft" },
  },
};

export const ZhLocale: Story = {
  args: (() => {
    const zhLocalized = localize(sample, "zh");
    return {
      locale: "zh",
      title: zhLocalized.title as string,
      shortPitch: zhLocalized.shortPitch as string,
      role: zhLocalized.role as string,
    };
  })(),
};
