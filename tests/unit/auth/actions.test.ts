import { beforeEach, describe, expect, it, vi } from "vitest";

// Characterization tests for the auth server actions (TD-001, slice C).
//
// actions.ts is a "use server" module with a heavy import graph (Supabase
// server + admin clients, Resend, next/cache, next/navigation, next/headers).
// This harness mocks that whole boundary so the action *logic* — guard order,
// Zod validation, Supabase-error → i18n-key classification, and redirect
// targets — can be pinned without a live backend.
//
// Deliberately kept real: `./redirect-url` (the open-redirect guard, already
// unit-tested) and `@/i18n/routing`, so the sanitize + locale behaviour the
// actions depend on stays genuine.

const h = vi.hoisted(() => {
  // redirect() in Next halts execution by throwing. We mirror that with a
  // typed signal carrying the resolved URL so success paths are assertable.
  class RedirectSignal extends Error {
    url: string;
    constructor(url: string) {
      super("NEXT_REDIRECT");
      this.url = url;
    }
  }
  return {
    RedirectSignal,
    isSupabaseConfigured: vi.fn(),
    createSupabaseServerClient: vi.fn(),
    getAdminSupabaseClient: vi.fn(),
    isFastAuthEmailConfigured: vi.fn(),
    getResendClient: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn((url: string) => {
      throw new h.RedirectSignal(url);
    }),
    headers: vi.fn(async () => new Headers()),
  };
});

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: h.isSupabaseConfigured,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: h.createSupabaseServerClient,
}));
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabaseClient: h.getAdminSupabaseClient,
  isFastAuthEmailConfigured: h.isFastAuthEmailConfigured,
}));
vi.mock("@/lib/email/client", () => ({ getResendClient: h.getResendClient }));
vi.mock("@/lib/email/templates/magic-link", () => ({
  MagicLinkEmail: vi.fn(() => null),
  renderMagicLinkText: vi.fn(() => "text body"),
}));
vi.mock("next/cache", () => ({ revalidatePath: h.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: h.redirect }));
vi.mock("next/headers", () => ({ headers: h.headers }));

import {
  deleteAccountAction,
  signInWithPasswordAction,
  signUpWithPasswordAction,
  unlinkIdentityAction,
  updatePasswordAction,
  requestMagicLinkAction,
  verifyEmailOtpAction,
} from "@/lib/auth/actions";

// --- helpers ---------------------------------------------------------------

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

type SupabaseError = { code?: string; status?: number; message?: string };

interface FakeAuth {
  signInWithOtp: ReturnType<typeof vi.fn>;
  verifyOtp: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  unlinkIdentity: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
}

interface FakeClient {
  rpc: ReturnType<typeof vi.fn>;
  auth: FakeAuth;
}

// A Supabase server client with every method defaulting to success. Tests
// override the one method they exercise.
function fakeClient(): FakeClient {
  return {
    rpc: vi.fn(async () => ({ error: null })),
    auth: {
      signInWithOtp: vi.fn(async () => ({ error: null })),
      verifyOtp: vi.fn(async () => ({ error: null })),
      signInWithPassword: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
      getUser: vi.fn(async () => ({ data: { user: null } })),
      updateUser: vi.fn(async () => ({ error: null })),
      unlinkIdentity: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
    },
  };
}

let client: FakeClient;
const idle = { status: "idle" } as const;

beforeEach(() => {
  vi.clearAllMocks();
  // Silence the module's dev-mode console.warn/error diagnostics.
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});

  client = fakeClient();
  h.isSupabaseConfigured.mockReturnValue(true);
  h.createSupabaseServerClient.mockResolvedValue(client);
  h.isFastAuthEmailConfigured.mockReturnValue(false);
  h.getAdminSupabaseClient.mockReturnValue(null);
  h.headers.mockResolvedValue(new Headers({ origin: "https://m4rkyu.com" }));
});

// --- requestMagicLinkAction ------------------------------------------------

describe("requestMagicLinkAction", () => {
  it("short-circuits when Supabase is not configured", async () => {
    h.isSupabaseConfigured.mockReturnValue(false);
    const result = await requestMagicLinkAction(idle, form({ email: "a@b.com" }));
    expect(result).toEqual({ status: "error", messageKey: "unconfigured" });
    expect(h.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("rejects an invalid email before touching Supabase", async () => {
    const result = await requestMagicLinkAction(idle, form({ email: "not-an-email" }));
    expect(result).toEqual({ status: "error", messageKey: "invalidEmail" });
    expect(h.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("maps the RPC P0001 rate-limit code to rateLimited", async () => {
    client.rpc.mockResolvedValue({ error: { code: "P0001" } satisfies SupabaseError });
    const result = await requestMagicLinkAction(idle, form({ email: "a@b.com" }));
    expect(result).toEqual({ status: "error", messageKey: "rateLimited" });
  });

  it("continues past a non-P0001 RPC error and sends via the slow path", async () => {
    client.rpc.mockResolvedValue({ error: { message: "migration missing" } });
    const result = await requestMagicLinkAction(idle, form({ email: "a@b.com" }));
    expect(result).toEqual({ status: "sent", email: "a@b.com" });
    expect(client.auth.signInWithOtp).toHaveBeenCalledOnce();
  });

  it("classifies a 429 from the slow path as rateLimited", async () => {
    client.auth.signInWithOtp.mockResolvedValue({ error: { status: 429 } });
    const result = await requestMagicLinkAction(idle, form({ email: "a@b.com" }));
    expect(result).toEqual({ status: "error", messageKey: "rateLimited" });
  });

  it("returns sendFailed for an unclassified slow-path error", async () => {
    client.auth.signInWithOtp.mockResolvedValue({ error: { message: "smtp down" } });
    const result = await requestMagicLinkAction(idle, form({ email: "a@b.com" }));
    expect(result).toEqual({ status: "error", messageKey: "sendFailed" });
  });

  it("uses the fast Resend path when configured", async () => {
    h.isFastAuthEmailConfigured.mockReturnValue(true);
    const admin = {
      auth: {
        admin: {
          generateLink: vi.fn(async () => ({
            data: { properties: { action_link: "https://link", email_otp: "123456" } },
            error: null,
          })),
          createUser: vi.fn(),
        },
      },
    };
    h.getAdminSupabaseClient.mockReturnValue(admin);
    h.getResendClient.mockReturnValue({ emails: { send: vi.fn(async () => ({ error: null })) } });
    // INQUIRY_FROM_EMAIL is unset in the test env, so the sender guard trips
    // and the fast path reports "failed" — the action then falls back to the
    // slow path, which still yields a sent state.
    const result = await requestMagicLinkAction(idle, form({ email: "a@b.com" }));
    expect(result).toEqual({ status: "sent", email: "a@b.com" });
    expect(admin.auth.admin.generateLink).toHaveBeenCalled();
    expect(client.auth.signInWithOtp).toHaveBeenCalled();
  });
});

// --- verifyEmailOtpAction --------------------------------------------------

describe("verifyEmailOtpAction", () => {
  it("rejects a malformed token", async () => {
    const result = await verifyEmailOtpAction(idle, form({ email: "a@b.com", token: "12" }));
    expect(result).toEqual({ status: "error", messageKey: "invalidOtp" });
  });

  it("classifies an expired token", async () => {
    client.auth.verifyOtp.mockResolvedValue({ error: { code: "otp_expired" } });
    const result = await verifyEmailOtpAction(
      idle,
      form({ email: "a@b.com", token: "123456" }),
    );
    expect(result).toEqual({ status: "error", messageKey: "otpExpired" });
  });

  it("redirects to the sanitized next path on success", async () => {
    await expect(
      verifyEmailOtpAction(
        idle,
        form({ email: "a@b.com", token: "123456", next: "/en/account" }),
      ),
    ).rejects.toMatchObject({ url: "/en/account" });
    expect(h.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("falls back to the default locale when next is an open-redirect attempt", async () => {
    await expect(
      verifyEmailOtpAction(
        idle,
        form({ email: "a@b.com", token: "123456", next: "//evil.example" }),
      ),
    ).rejects.toMatchObject({ url: "/en" });
  });
});

// --- signInWithPasswordAction ----------------------------------------------

describe("signInWithPasswordAction", () => {
  it("rejects malformed input", async () => {
    const result = await signInWithPasswordAction(
      idle,
      form({ email: "bad", password: "short" }),
    );
    expect(result).toEqual({ status: "error", messageKey: "invalidInput" });
  });

  it("returns invalidCredentials for a generic auth error", async () => {
    client.auth.signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials" } });
    const result = await signInWithPasswordAction(
      idle,
      form({ email: "a@b.com", password: "password1" }),
    );
    expect(result).toEqual({ status: "error", messageKey: "invalidCredentials" });
  });

  it("distinguishes an unconfirmed email", async () => {
    client.auth.signInWithPassword.mockResolvedValue({ error: { code: "email_not_confirmed" } });
    const result = await signInWithPasswordAction(
      idle,
      form({ email: "a@b.com", password: "password1" }),
    );
    expect(result).toEqual({ status: "error", messageKey: "unconfirmedEmail" });
  });

  it("redirects on success", async () => {
    await expect(
      signInWithPasswordAction(
        idle,
        form({ email: "a@b.com", password: "password1", next: "/en/account" }),
      ),
    ).rejects.toMatchObject({ url: "/en/account" });
    expect(h.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

// --- signUpWithPasswordAction ----------------------------------------------

describe("signUpWithPasswordAction", () => {
  it("maps a too-short password to weakPassword (pre-Supabase)", async () => {
    const result = await signUpWithPasswordAction(
      idle,
      form({ email: "a@b.com", password: "short" }),
    );
    expect(result).toEqual({ status: "error", messageKey: "weakPassword" });
    expect(h.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("surfaces userAlreadyExists from Supabase", async () => {
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: { code: "user_already_exists" },
    });
    const result = await signUpWithPasswordAction(
      idle,
      form({ email: "a@b.com", password: "password1" }),
    );
    expect(result).toEqual({ status: "error", messageKey: "userAlreadyExists" });
  });

  it("returns confirmSent when no session is created (confirm-email on)", async () => {
    const result = await signUpWithPasswordAction(
      idle,
      form({ email: "a@b.com", password: "password1" }),
    );
    expect(result).toEqual({ status: "confirmSent", email: "a@b.com" });
  });

  it("redirects when a session is returned (confirm-email off)", async () => {
    client.auth.signUp.mockResolvedValue({
      data: { session: { access_token: "t" } },
      error: null,
    });
    await expect(
      signUpWithPasswordAction(
        idle,
        form({ email: "a@b.com", password: "password1", next: "/en/account" }),
      ),
    ).rejects.toMatchObject({ url: "/en/account" });
  });
});

// --- updatePasswordAction --------------------------------------------------

describe("updatePasswordAction", () => {
  it("rejects a guest (no cookie session)", async () => {
    const result = await updatePasswordAction(idle, form({ password: "password1" }));
    expect(result).toEqual({ status: "error", messageKey: "guest" });
  });

  it("rejects a weak password for a signed-in user", async () => {
    client.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const result = await updatePasswordAction(idle, form({ password: "short" }));
    expect(result).toEqual({ status: "error", messageKey: "weakPassword" });
  });

  it("returns ok on a successful update", async () => {
    client.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const result = await updatePasswordAction(idle, form({ password: "password1" }));
    expect(result).toEqual({ status: "ok" });
    expect(h.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

// --- unlinkIdentityAction --------------------------------------------------

describe("unlinkIdentityAction", () => {
  it("refuses to remove the last identity", async () => {
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "u1", identities: [{ identity_id: "only" }] } },
    });
    const result = await unlinkIdentityAction(idle, form({ identity_id: "only" }));
    expect(result).toEqual({ status: "error", messageKey: "lastIdentity" });
    expect(client.auth.unlinkIdentity).not.toHaveBeenCalled();
  });

  it("returns notFound when the identity id is unknown", async () => {
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "u1", identities: [{ identity_id: "a" }, { identity_id: "b" }] } },
    });
    const result = await unlinkIdentityAction(idle, form({ identity_id: "missing" }));
    expect(result).toEqual({ status: "error", messageKey: "notFound" });
  });

  it("unlinks a valid identity and returns ok", async () => {
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "u1", identities: [{ identity_id: "a" }, { identity_id: "b" }] } },
    });
    const result = await unlinkIdentityAction(idle, form({ identity_id: "b" }));
    expect(result).toEqual({ status: "ok" });
    expect(client.auth.unlinkIdentity).toHaveBeenCalledWith({ identity_id: "b" });
  });
});

// --- deleteAccountAction ---------------------------------------------------

describe("deleteAccountAction", () => {
  it("requires the typed email to match the session email", async () => {
    client.auth.getUser.mockResolvedValue({ data: { user: { email: "me@x.com" } } });
    const result = await deleteAccountAction(idle, form({ confirmation: "wrong@x.com" }));
    expect(result).toEqual({ status: "error", messageKey: "confirmationMismatch" });
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("deletes, signs out, and redirects on a matching confirmation", async () => {
    client.auth.getUser.mockResolvedValue({ data: { user: { email: "Me@X.com" } } });
    await expect(
      deleteAccountAction(idle, form({ confirmation: "  me@x.com  ", locale: "en" })),
    ).rejects.toMatchObject({ url: "/en?accountDeleted=1" });
    expect(client.rpc).toHaveBeenCalledWith("delete_my_account");
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});
