// Public navigation surface. The bare `Link` export is now the
// View-Transitions-aware `TransitionLink`, so every existing import
// of `@/i18n/navigation`'s Link automatically picks up the upgrade.
// Components that need the raw next-intl Link (very rare — currently
// only `TransitionLink` itself) should import from
// `@/i18n/navigation.internal`.
export {
  redirect,
  usePathname,
  useRouter,
  getPathname,
} from "./navigation.internal";

export { TransitionLink as Link } from "@/components/system/transition-link";
