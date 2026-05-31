import { getTranslations } from "next-intl/server";
import { HomeSection } from "./home-section";
import { AskConsole } from "./ask-console";

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
    >
      <AskConsole />
    </HomeSection>
  );
}
