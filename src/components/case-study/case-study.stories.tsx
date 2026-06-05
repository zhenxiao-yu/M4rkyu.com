import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TechStackPanel } from "./tech-stack-panel";
import { ScreenshotGallery } from "./screenshot-gallery";
import { SpecRail } from "./spec-rail";

const meta = {
  title: "case-study/Project page",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const galleryLabels = {
  viewLarger: "View",
  close: "Close",
  previous: "Previous",
  next: "Next",
};

const cover = "/project-covers/nimbus.svg";

export const StackGrouped: Story = {
  render: () => (
    <div className="max-w-3xl">
      <TechStackPanel
        groups={[
          { group: "Frontend", items: ["Next.js", "TypeScript", "Tailwind CSS"] },
          { group: "Backend", items: ["Appwrite", "Node.js"] },
          { group: "Tooling", items: ["Vercel", "Chart.js", "Unknown Lib"] },
        ]}
        stack={[]}
      />
    </div>
  ),
};

export const StackFlatFallback: Story = {
  render: () => (
    <div className="max-w-3xl">
      <TechStackPanel
        stack={["React", "Vite", "TanStack Query", "WebSocket", "Vercel"]}
      />
    </div>
  ),
};

export const Screenshots: Story = {
  render: () => (
    <div className="max-w-3xl">
      <ScreenshotGallery
        labels={galleryLabels}
        shots={[
          {
            src: cover,
            alt: "Dashboard view",
            label: "Dashboard",
            caption: "The main file surface with storage analytics.",
          },
          {
            src: "/project-covers/bioloom.svg",
            alt: "Mobile view",
            label: "Mobile",
            caption: "Responsive layout down to 360px.",
          },
          {
            src: "/project-covers/m4rketview.svg",
            alt: "Settings",
            label: "Settings",
          },
        ]}
      />
    </div>
  ),
};

export const Spec: Story = {
  render: () => (
    <div className="max-w-[260px]">
      <SpecRail
        sections={[
          { id: "overview", label: "What it is" },
          { id: "screens", label: "What it looks like" },
          { id: "stack", label: "Built with" },
          { id: "outcome", label: "Outcome" },
        ]}
        facts={[
          { label: "Role", value: "Full-stack product engineer" },
          { label: "Timeline", value: "3 weeks · 2024" },
          { label: "Platforms", value: "Web" },
        ]}
        liveUrl="https://example.com"
        githubUrl="https://github.com/example/repo"
        labels={{
          onThisPage: "On this page",
          spec: "Quick facts",
          live: "Live",
          source: "Source",
        }}
      />
    </div>
  ),
};
