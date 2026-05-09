import type { Preview } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../messages/en.json";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    viewport: {
      viewports: {
        mobile360: { name: "Mobile 360", styles: { width: "360px", height: "780px" } },
        tablet768: { name: "Tablet 768", styles: { width: "768px", height: "1024px" } },
        desktop1440: { name: "Desktop 1440", styles: { width: "1440px", height: "900px" } },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || "dark";
      return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <div data-theme={theme} className="min-h-screen bg-background p-6 text-foreground">
            <Story />
          </div>
        </NextIntlClientProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      description: "Theme",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["dark", "light"],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
