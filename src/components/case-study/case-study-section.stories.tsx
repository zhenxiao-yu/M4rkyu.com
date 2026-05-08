import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CaseStudyList, CaseStudySection } from "./case-study-section";

interface SectionStoryArgs {
  eyebrow?: string;
  title: string;
  body?: string;
  items?: string[];
  numbered?: boolean;
}

function CaseStudySectionStory({
  eyebrow,
  title,
  body,
  items,
  numbered,
}: SectionStoryArgs) {
  return (
    <CaseStudySection eyebrow={eyebrow} title={title}>
      {body ? <p>{body}</p> : null}
      {items ? (
        <CaseStudyList
          className="mt-5"
          items={items}
          numbered={numbered}
        />
      ) : null}
    </CaseStudySection>
  );
}

const meta = {
  title: "case-study/CaseStudySection",
  component: CaseStudySectionStory,
} satisfies Meta<typeof CaseStudySectionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "01 · Problem",
    title: "Personal cloud tools either feel too bare or too opaque",
    body: "The case study unpacks how Nimbus reframes the storage interface as an operating surface — uploads, access, and usage signals presented at a calm, readable density.",
  },
};

export const WithBulletList: Story = {
  args: {
    eyebrow: "Architecture",
    title: "Boundaries the case study leans on",
    items: [
      "Server-rendered routes keep the dashboard shell quick to parse.",
      "Client interactivity is scoped to upload state, charts, and account actions.",
      "Storage primitives stay abstracted away from the visible product surface.",
    ],
  },
};

export const WithNumberedList: Story = {
  args: {
    eyebrow: "Process",
    title: "Three moves that shaped the redesign",
    items: [
      "Audit the existing Vite portfolio for content debt before moving any files.",
      "Stand up the Zod-backed content layer first, then route components onto it.",
      "Layer in editorial typography only after the structural work is calm.",
    ],
    numbered: true,
  },
};
