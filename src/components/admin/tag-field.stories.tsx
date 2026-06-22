import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TagField } from "./tag-field";

// TagField reads its per-field error from the AdminForm errors context; with
// no provider that resolves to the `error` prop, so it renders standalone.
const meta = {
  title: "admin/TagField",
  component: TagField,
  args: {
    label: "Tech stack",
    name: "stack",
    hint: "Type a value, then Enter or comma to add it",
    placeholder: "Next.js, Supabase…",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: { defaultValue: "Next.js\nReact 19\nSupabase\nTailwind v4" },
};

export const WithError: Story = {
  args: {
    label: "Platforms",
    name: "platforms",
    defaultValue: "Web",
    error: "Add at least two platforms.",
  },
};
