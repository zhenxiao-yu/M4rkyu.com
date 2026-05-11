import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { TooltipProvider } from "@/components/ui/tooltip";
import zhMessages from "../../../messages/zh.json";
import { GameHud } from "./game-hud";

// GameHud composes LanguageSwitcher / ThemeSwitcher / SoundToggle, all
// of which render tooltips. Provide a TooltipProvider so the embedded
// triggers don't throw outside the real `[locale]/layout.tsx` shell.
const meta = {
  title: "Sections/GameHud",
  component: GameHud,
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={200}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  args: {
    hint: ">_ press ⌘K",
    ariaLabel: "System status",
  },
} satisfies Meta<typeof GameHud>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ZhLocale: Story = {
  args: {
    hint: ">_ 按 ⌘K",
    ariaLabel: "系统状态",
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
