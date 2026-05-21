import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "./sonner";

// Interactive harness for the site toast system. Fire toasts (or a
// burst of them) and watch them stack vertically bottom-right with the
// streamlined `expand` / `visibleToasts` / `gap` config from sonner.tsx.
function ToastLab() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-foreground">Toast system</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fire toasts and watch them stack gracefully (bottom-right). Hover
          the stack to inspect; older toasts past four fold away.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success("Saved to your archive.")}>
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.error("Something went wrong.")}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Heads up", { description: "An informational message." })
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Play ambient music?", {
              id: "audio-autoplay-consent",
              description: "Enable it now and on future visits?",
              duration: 12000,
              action: { label: "Enable", onClick: () => undefined },
              cancel: { label: "Not now", onClick: () => undefined },
            })
          }
        >
          Consent toast
        </Button>
        <Button
          onClick={() => {
            toast.success("Saved to your archive.");
            toast.error("Upload failed — retrying.");
            toast("New message", { description: "From the contact form." });
            toast.success("Profile updated.");
            toast("This one folds away below the stack.");
          }}
        >
          Fire 5 (stack)
        </Button>
      </div>
      <Toaster />
    </div>
  );
}

const meta = {
  title: "UI/Toaster",
  component: Toaster,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => <ToastLab />,
};
