import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "./get-current-user";

/**
 * Server-only guard. Returns the current user or redirects to the
 * locale-prefixed home for guests.
 *
 * The `locale` parameter is required because the redirect target is
 * locale-prefixed (we always prefix per next-intl `localePrefix: "always"`).
 */
export async function requireUser(locale: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}`);
  }
  return user;
}
