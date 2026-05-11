import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import zhMessages from "../../../messages/zh.json";
import { CommandHero } from "./command-hero";

const meta = {
  title: "Sections/CommandHero",
  component: CommandHero,
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommandHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithStatus: Story = {
  args: {
    status: {
      label: "Nimbus · secure file vault",
      href: "/projects/nimbus",
      accessibleLabel: "Open Nimbus case study",
    },
  },
};

export const ZhLocale: Story = {
  args: {
    versionLabel: "v2027",
    markGlyph: `> M4RKYU
> 系统在线
> 工程师 · 艺术家 · 开发者`,
    status: {
      label: "Nimbus · 安全文件库",
      href: "/projects/nimbus",
      accessibleLabel: "打开 Nimbus 案例研究",
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
