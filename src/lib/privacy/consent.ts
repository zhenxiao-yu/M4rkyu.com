"use client";

import {
  dispatchStoredValueChanged,
  readStoredJson,
  readStoredString,
  writeStoredJson,
} from "@/lib/browser/safe-storage";

export interface ConsentState {
  version: 1;
  analytics: boolean;
  personalization: boolean;
  updatedAt: string;
}

const CONSENT_KEY = "m4rkyu.consent";
const CONSENT_COOKIE = "m4rkyu_consent";
const CONSENT_EVENT = "m4rkyu:consent-changed";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

let cachedConsent: ConsentState | null = null;
let cachedHasStoredConsent: boolean | null = null;

export const DEFAULT_CONSENT: ConsentState = {
  version: 1,
  analytics: false,
  personalization: false,
  updatedAt: "",
};

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ConsentState>;
  return (
    candidate.version === 1 &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.personalization === "boolean" &&
    typeof candidate.updatedAt === "string"
  );
}

function readCookieConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const prefix = `${CONSENT_COOKIE}=`;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));
  if (!entry) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(entry.slice(prefix.length)));
    return isConsentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: ConsentState): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = [
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}`,
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
    secure,
  ].join("; ");
}

export function hasStoredConsent(): boolean {
  if (cachedHasStoredConsent !== null) return cachedHasStoredConsent;
  cachedHasStoredConsent =
    readCookieConsent() !== null || readStoredString(CONSENT_KEY) !== "";
  return cachedHasStoredConsent;
}

export function readConsent(): ConsentState {
  cachedConsent ??= readCookieConsent() ?? readConsentFromStorage();
  return cachedConsent;
}

function readConsentFromStorage(): ConsentState {
  return readStoredJson(CONSENT_KEY, DEFAULT_CONSENT, isConsentState);
}

export function saveConsent(
  next: Pick<ConsentState, "analytics" | "personalization">,
): ConsentState {
  const consent: ConsentState = {
    version: 1,
    analytics: next.analytics,
    personalization: next.personalization,
    updatedAt: new Date().toISOString(),
  };

  writeStoredJson(CONSENT_KEY, consent);
  writeConsentCookie(consent);
  cachedConsent = consent;
  cachedHasStoredConsent = true;
  dispatchStoredValueChanged(CONSENT_EVENT);
  return consent;
}

export function subscribeConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  function handleChange() {
    cachedConsent = null;
    cachedHasStoredConsent = null;
    callback();
  }

  window.addEventListener(CONSENT_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export const CONSENT_STORAGE_KEY = CONSENT_KEY;
