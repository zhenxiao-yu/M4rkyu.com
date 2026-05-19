import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResourcePreviewCard } from "./resource-preview-card";
import { resources } from "@/content/resources";
import type { Resource } from "@/content/schemas";

function ResourcePreviewCardStory({ resource }: { resource: Resource }) {
  return (
    <div className="mx-auto grid w-full max-w-sm">
      <ResourcePreviewCard resource={resource} />
    </div>
  );
}

const meta = {
  title: "cards/ResourcePreviewCard",
  component: ResourcePreviewCardStory,
} satisfies Meta<typeof ResourcePreviewCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { resource: resources[0] },
};

const draftResource: Resource = {
  name: "Storybook",
  slug: "storybook",
  category: "UI documentation",
  description:
    "Component workspace for visual states, accessibility checks, and design-system review.",
  why: "Placeholder: expand stories as each final section component lands.",
  type: "link",
  link: "https://storybook.js.org",
  pricing: "Free",
  tags: ["components", "a11y", "documentation"],
  status: "draft",
  featured: false,
};

export const Draft: Story = {
  args: { resource: draftResource },
};
