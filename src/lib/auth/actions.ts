/**
 * Auth server actions — public surface.
 *
 * The implementations are split by concern under `./actions/`:
 *   - passwordless.ts — magic-link send + OTP verify
 *   - password.ts     — sign-in / sign-up / update-password
 *   - account.ts      — sign-out / unlink-identity / delete-account
 *   - schemas.ts      — shared Zod input schemas
 *
 * This barrel keeps the historical `@/lib/auth/actions` import path
 * stable for every callsite. Each implementation file carries its own
 * `"use server"` directive, so the actions retain their server-action
 * identity when re-exported here.
 */
export { requestMagicLinkAction, verifyEmailOtpAction } from "./actions/passwordless";
export {
  signInWithPasswordAction,
  signUpWithPasswordAction,
  updatePasswordAction,
} from "./actions/password";
export {
  signOutAction,
  unlinkIdentityAction,
  deleteAccountAction,
} from "./actions/account";

export type { UpdatePasswordState } from "./actions/password";
export type { UnlinkIdentityState, DeleteAccountState } from "./actions/account";
