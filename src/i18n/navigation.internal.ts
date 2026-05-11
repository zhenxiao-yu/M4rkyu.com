import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Raw next-intl navigation primitives. The public `@/i18n/navigation`
// barrel re-exports everything from here, except the bare `Link` —
// which is replaced by the View-Transitions-aware `TransitionLink`.
// Components that need to call the raw `Link` directly (notably
// `TransitionLink` itself) import from this internal module to avoid
// a circular dependency.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
