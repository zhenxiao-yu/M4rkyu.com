import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NowConsole } from "./now-console";

const meta = {
  title: "about/NowConsole",
  component: NowConsole,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px] max-w-full p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NowConsole>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uses the live `profile.currently` feed. */
export const Default: Story = {};

/** A `listening` channel with detail + an external link — exercises the
 *  now-playing scrubber, the "on air" badge, and the open-link affordance. */
export const NowPlaying: Story = {
  args: {
    items: [
      {
        kind: "listening",
        label: "Hiroshi Yoshimura — Music for Nine Postcards",
        detail: "Environmental ambient, 1982. On repeat while shipping.",
        url: "https://open.spotify.com/album/0xzaQen3Vr0g4Wv6e7q5Yg",
      },
      { kind: "building", label: "m4rkyu.com — the long-form archive" },
      { kind: "reading", label: "Designing Data-Intensive Applications" },
      { kind: "watching", label: "Severance, season 2" },
    ],
  },
};

/** Single channel — the tuner collapses and auto-tune stays off. */
export const SingleChannel: Story = {
  args: {
    items: [{ kind: "building", label: "m4rkyu.com — the long-form archive" }],
  },
};

/** Empty feed — falls back to the quiet placeholder line. */
export const Empty: Story = {
  args: { items: [] },
};
