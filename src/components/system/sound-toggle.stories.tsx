import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import zhMessages from "../../../messages/zh.json";
import { SoundToggle } from "./sound-toggle";

// The toggle has no `enabled` prop — state lives in localStorage under
// `m4rkyu.sound`. Stories that need the "on" visual pre-seed that key
// before the component mounts so `useSyncExternalStore`'s client
// snapshot reads `true` on the very first paint.
const SOUND_STORAGE_KEY = "m4rkyu.sound";

function SeedSoundState({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off");
  }
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SOUND_STORAGE_KEY);
      }
    };
  }, []);
  return <>{children}</>;
}

const meta = {
  title: "System/SoundToggle",
  component: SoundToggle,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={200}>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof SoundToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <SeedSoundState enabled={false}>
        <Story />
      </SeedSoundState>
    ),
  ],
};

export const Enabled: Story = {
  decorators: [
    (Story) => (
      <SeedSoundState enabled={true}>
        <Story />
      </SeedSoundState>
    ),
  ],
};

export const ZhLocale: Story = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <SeedSoundState enabled={false}>
          <Story />
        </SeedSoundState>
      </NextIntlClientProvider>
    ),
  ],
};
