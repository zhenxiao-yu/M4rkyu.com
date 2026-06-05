import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Scribble } from "./scribble";
import { HandNote, HandCaption } from "./hand-note";
import { Polaroid } from "./polaroid";

const meta = {
  title: "sketch/Warm hand",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scribbles: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-12 p-8">
      <span className="relative font-heading text-2xl font-semibold">
        worth showing
        <Scribble
          variant="underline"
          className="absolute -bottom-3 left-0 h-3 w-full"
        />
      </span>
      <span className="relative inline-grid place-items-center px-3 py-1 font-mono text-2xl">
        07
        <Scribble
          variant="circle"
          className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]"
        />
      </span>
      <span className="relative font-heading text-2xl text-muted-foreground">
        genius founder
        <Scribble variant="strike" className="absolute inset-x-0 top-1/2 h-3" />
      </span>
      <span className="relative font-heading text-2xl">
        this one
        <Scribble
          variant="arrow"
          className="absolute -right-12 -top-6 size-12"
        />
      </span>
      <span className="relative px-2 py-1 font-mono text-xl">
        beta
        <Scribble
          variant="box"
          className="absolute -inset-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+0.75rem)]"
        />
      </span>
      <span className="relative font-heading text-2xl text-muted-foreground">
        oops
        <Scribble variant="scratch" className="absolute inset-x-0 top-0 h-full" />
      </span>
    </div>
  ),
};

export const Handwriting: Story = {
  render: () => (
    <div className="grid max-w-md gap-6 p-8">
      <HandNote className="text-ring">made this at 2am, no regrets</HandNote>
      <HandNote tilt={2}>
        ignore the placeholder, real photos coming
      </HandNote>
      <HandNote tilt={0} className="text-2xl text-foreground">
        a creative guy who builds cool internet things
      </HandNote>
      <HandCaption>somewhere over the pacific, 2024</HandCaption>
    </div>
  ),
};

export const Polaroids: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8 p-10">
      <Polaroid
        src="/project-covers/bloomprint.svg"
        alt="Bloomprint cover"
        caption="bloomprint, first commit"
        tilt={-3}
      />
      <Polaroid
        alt="Travel placeholder"
        caption="kyoto, lost the rest"
        tilt={2.5}
      />
      <Polaroid
        src="/project-covers/descent-into-madness.svg"
        alt="Descent cover"
        caption="still cooking"
        tilt={-1}
        tape={false}
      />
    </div>
  ),
};

// The thesis in one frame: a cold cyber readout, annotated by a human.
export const InContext: Story = {
  render: () => (
    <div className="relative max-w-xl p-12">
      <div className="rounded-xl border border-border bg-card/60 p-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            status
          </span>
          <span className="size-1.5 rounded-full bg-ring" />
        </div>
        <dl className="grid gap-2 pt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <div className="flex justify-between">
            <dt>shipped</dt>
            <dd className="text-foreground">07</dd>
          </div>
          <div className="flex justify-between">
            <dt>still cooking</dt>
            <dd className="text-foreground">03</dd>
          </div>
        </dl>
      </div>
      <HandNote
        tilt={-6}
        className="absolute -right-2 top-2 text-ring"
      >
        the 03 is the fun stuff →
      </HandNote>
      <div className="absolute -bottom-2 -left-4">
        <Polaroid
          alt="desk placeholder"
          caption="the desk, mid-chaos"
          tilt={-7}
          className="w-40"
        />
      </div>
    </div>
  ),
};
