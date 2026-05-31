import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { DropzoneLabels } from "@/components/admin/image-dropzone";

// Shared copy for the admin ImageDropzone, sourced once from the Admin
// namespace so every content form (media, projects, shop, …) reuses the
// same bilingual strings instead of duplicating them per namespace.
export async function buildDropzoneLabels(
  locale: Locale,
): Promise<DropzoneLabels> {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    prompt: t("dropzone.prompt"),
    replacePrompt: t("dropzone.replacePrompt"),
    current: t("dropzone.current"),
    browse: t("dropzone.browse"),
    clear: t("dropzone.clear"),
    tooLarge: t("dropzone.tooLarge"),
    wrongType: t("dropzone.wrongType"),
  };
}
