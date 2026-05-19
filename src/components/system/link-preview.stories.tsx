import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { LinkPreview } from "./link-preview";

const meta = {
  title: "System/LinkPreview",
  component: LinkPreview,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={200}>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof LinkPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const TriggerLink = ({ children }: { children: React.ReactNode }) => (
  <a
    href="#"
    className={cn(
      "rounded px-3 py-1.5 underline-offset-4 hover:underline",
      FOCUS_RING_INSET,
    )}
  >
    {children}
  </a>
);

export const Placeholder: Story = {
  args: {
    title: "Rebuilding M4rkyu.com as a black-and-white archive",
    lede: "Final notes on the design-system decisions, route architecture, and performance constraints.",
    eyebrow: "Devlog",
    placeholderLabel: "POST COVER TBD",
    children: <TriggerLink>Hover this title</TriggerLink>,
  },
};

export const WithCover: Story = {
  args: {
    title: "Nimbus case study",
    lede: "A secure file-management platform shaped around calm organization, OTP access, and storage analytics.",
    eyebrow: "Web app",
    image: { src: "/project-covers/nimbus.svg", alt: "Nimbus monochrome cover" },
    children: <TriggerLink>Hover this title</TriggerLink>,
  },
};

export const NoLede: Story = {
  args: {
    title: "Compact preview",
    eyebrow: "Eyebrow only",
    placeholderLabel: "FRAME TBD",
    children: <TriggerLink>Hover this title</TriggerLink>,
  },
};
