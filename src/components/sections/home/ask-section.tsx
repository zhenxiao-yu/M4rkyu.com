import { getTranslations } from "next-intl/server";
import { HomeSection } from "./home-section";
import { SectionBackground } from "./section-background";
import { AskConsole } from "./ask-console";
import { FadeIn } from "@/components/motion/fade-in";

/**
 * Home spine slide #2 — the M4RKYU.SYS terminal. A ChatGPT-style console,
 * grounded in the content catalog, that answers visitors in plain language
 * and links straight to the work. Snap tentpole, right after the Hero.
 */
export async function AskSection() {
  const t = await getTranslations("AskConsole");
  return (
    <HomeSection
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      dataSection="ask"
      background={<SectionBackground variant="terminal" />}
    >
      {/* The first handoff after the hero — let the console rise to meet
        * the descent instead of being revealed by occlusion. */}
      <FadeIn direction="up" duration={0.6}>
        <AskConsole />
      </FadeIn>
    </HomeSection>
  );
}
