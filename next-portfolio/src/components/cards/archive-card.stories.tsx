import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArchiveCard } from "./archive-card";

function ArchiveCardStory() {
  return (
    <div className="grid max-w-5xl gap-5 md:grid-cols-3">
      <ArchiveCard
        title="Draft project card"
        description="Placeholder: realistic card length that stress-tests line wrapping without inventing final results."
        eyebrow="Case study"
        status="draft"
        mediaLabel="PROJECT MEDIA TBD"
      />
      <ArchiveCard
        title="Coming soon gallery frame with a deliberately long title"
        description="Coming soon: replace with final caption, alt text, and optimized image asset."
        eyebrow="Gallery"
        status="coming-soon"
        mediaLabel="GALLERY MEDIA TBD"
      />
      <ArchiveCard
        title="Resource placeholder"
        description="TBD: resource description and link notes will be reviewed before launch."
        eyebrow="Resource"
        status="placeholder"
        mediaLabel="THUMBNAIL TBD"
      />
    </div>
  );
}

const meta = {
  title: "cards/ArchiveCard",
  component: ArchiveCardStory,
} satisfies Meta<typeof ArchiveCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
