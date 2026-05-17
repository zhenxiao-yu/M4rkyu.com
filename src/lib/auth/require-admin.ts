import "server-only";

import { notFound } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "./get-current-user";

/**
 * Server-only guard. Returns the current user if they're an admin;
 * otherwise raises a 404 (not 403) so the admin surface doesn't
 * advertise its own existence to drive-by traffic.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    notFound();
  }
  return user;
}
