import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  /** Direct sign-in URL the user can click. */
  actionLink: string;
  /** 6–8 digit OTP fallback for users who can't click the link. */
  otp: string;
  /** How long the link / OTP remain valid. */
  expiresInMinutes?: number;
  /** Origin to display in the footer (e.g. "m4rkyu.com"). */
  site?: string;
}

/**
 * Transactional template for magic-link / sign-in emails.
 *
 * Intentional English-only (mirrors the inquiry template's
 * convention) — we don't know the recipient's locale at send time
 * (the form is the only signal and we don't pass it through). The
 * landing page after they click respects locale routing.
 *
 * Inline styles so the email survives common client sanitisation
 * (Gmail, Outlook, Apple Mail). Colours mirror the light-theme
 * palette in globals.css.
 */
export function MagicLinkEmail({
  actionLink,
  otp,
  expiresInMinutes = 60,
  site = "m4rkyu.com",
}: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Your sign-in link for ${site} — expires in ${expiresInMinutes} minutes`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.eyebrow}>M4RKYU.SYS · SIGN IN</Text>
            <Heading style={styles.heading}>Tap to sign in</Heading>
            <Text style={styles.lede}>
              Click the button below to finish signing in to {site}. The link
              expires in {expiresInMinutes} minutes.
            </Text>
          </Section>

          <Section style={styles.buttonWrapper}>
            <Button href={actionLink} style={styles.button}>
              Sign in to {site}
            </Button>
          </Section>

          <Section>
            <Text style={styles.fallbackLabel}>
              Or paste this code into the sign-in dialog:
            </Text>
            <Text style={styles.otp}>{otp}</Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.footnote}>
              If you didn&apos;t request this, you can ignore the email — no
              account changes were made.
            </Text>
            <Text style={styles.footnote}>{site}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Plaintext fallback. Important for deliverability: senders without
 * a text/plain part get downranked by Gmail and rejected outright by
 * some corporate inbox filters.
 */
export function renderMagicLinkText({
  actionLink,
  otp,
  expiresInMinutes = 60,
  site = "m4rkyu.com",
}: MagicLinkEmailProps): string {
  return [
    `M4RKYU.SYS — SIGN IN`,
    ``,
    `Tap to sign in to ${site}. The link expires in ${expiresInMinutes} minutes.`,
    ``,
    actionLink,
    ``,
    `Or paste this code into the sign-in dialog:`,
    otp,
    ``,
    `If you didn't request this, ignore the email — no account changes were made.`,
    ``,
    site,
  ].join("\n");
}

const styles = {
  body: {
    backgroundColor: "#f5f3ee",
    color: "#0a0a0a",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
    padding: "32px 16px",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #cecbc2",
    borderRadius: "8px",
    padding: "32px",
  },
  eyebrow: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "11px",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "#5f5f5f",
    margin: "0 0 16px 0",
  },
  heading: {
    fontSize: "22px",
    lineHeight: "1.3",
    fontWeight: 600,
    color: "#0a0a0a",
    margin: "0 0 12px 0",
  },
  lede: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#3a3a3a",
    margin: "0 0 24px 0",
  },
  buttonWrapper: {
    margin: "24px 0",
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: "6px",
    padding: "12px 24px",
    display: "inline-block",
  },
  fallbackLabel: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "#5f5f5f",
    margin: "24px 0 8px 0",
  },
  otp: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "22px",
    letterSpacing: "0.3em",
    color: "#0a0a0a",
    backgroundColor: "#f5f3ee",
    border: "1px solid #cecbc2",
    borderRadius: "6px",
    padding: "12px 16px",
    margin: 0,
    textAlign: "center" as const,
  },
  hr: {
    borderColor: "#e9e7e0",
    margin: "24px 0",
  },
  footnote: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#5f5f5f",
    margin: "0 0 8px 0",
  },
};
