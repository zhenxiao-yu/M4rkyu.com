import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlaceholderImage } from "./placeholder-image";
import { PlaceholderVideo } from "./placeholder-video";
import { PlaceholderCard } from "./placeholder-card";
import { ComingSoonBlock } from "./coming-soon-block";
import { EmptyArchiveState } from "./empty-archive-state";
import { MediaFrame } from "./media-frame";
import { ContentPendingLabel } from "./content-pending-label";

function PlaceholderStates() {
  return (
    <div className="grid gap-8">
      <div>
        <ContentPendingLabel label="PLACEHOLDER SYSTEM" />
        <h1 className="mt-4 text-3xl font-semibold">Intentional draft states</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          These components keep incomplete archives polished while clearly marking TBD,
          Placeholder, Draft, and Coming soon content.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <PlaceholderImage label="MEDIA TBD" />
        <PlaceholderVideo label="VIDEO POSTER TBD" />
      </div>
      <MediaFrame eyebrow="storybook" label="DRAFT">
        <div className="grid gap-4 md:grid-cols-3">
          <PlaceholderImage label="FRAME 01 TBD" aspect="aspect-3/4" />
          <PlaceholderImage label="FRAME 02 TBD" aspect="aspect-3/4" />
          <PlaceholderImage label="FRAME 03 TBD" aspect="aspect-3/4" />
        </div>
      </MediaFrame>
      <div className="grid gap-5 md:grid-cols-3">
        <PlaceholderCard />
        <ComingSoonBlock />
        <EmptyArchiveState />
      </div>
    </div>
  );
}

const meta = {
  title: "states/PlaceholderStates",
  component: PlaceholderStates,
} satisfies Meta<typeof PlaceholderStates>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
