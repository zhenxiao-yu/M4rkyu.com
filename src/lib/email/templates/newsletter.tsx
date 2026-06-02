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

// Double-opt-in confirmation + welcome emails for the newsletter. English-
// only, mirroring the magic-link / inquiry convention (we don't know the
// subscriber's locale at send time). Inline styles survive client
// sanitisation; palette mirrors the light theme.

interface ConfirmProps {
  /** The signed double-opt-in confirmation URL. */
  confirmLink: string;
  site?: string;
}

export function NewsletterConfirmEmail({
  confirmLink,
  site = "m4rkyu.com",
}: ConfirmProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Confirm your subscription to ${site}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.eyebrow}>M4RKYU.SYS · NEWSLETTER</Text>
            <Heading style={styles.heading}>Confirm your subscription</Heading>
            <Text style={styles.lede}>
              Tap below to confirm you want occasional notes and logs from{" "}
              {site}. If this wasn&apos;t you, ignore this email — nothing
              happens without confirmation.
            </Text>
          </Section>
          <Section style={styles.buttonWrapper}>
            <Button href={confirmLink} style={styles.button}>
              Confirm subscription
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Section>
            <Text style={styles.footnote}>{site}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function renderNewsletterConfirmText({
  confirmLink,
  site = "m4rkyu.com",
}: ConfirmProps): string {
  return [
    "M4RKYU.SYS — NEWSLETTER",
    "",
    `Confirm your subscription to ${site}:`,
    "",
    confirmLink,
    "",
    "If this wasn't you, ignore this email — nothing happens without confirmation.",
    "",
    site,
  ].join("\n");
}

interface WelcomeProps {
  /** Absolute URL to the site / latest feed. */
  homeLink: string;
  site?: string;
}

export function NewsletterWelcomeEmail({
  homeLink,
  site = "m4rkyu.com",
}: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>{`You're subscribed to ${site}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.eyebrow}>M4RKYU.SYS · NEWSLETTER</Text>
            <Heading style={styles.heading}>You&apos;re in.</Heading>
            <Text style={styles.lede}>
              Thanks for subscribing to {site}. You&apos;ll get occasional notes
              and logs — short, dated, no noise. Start anywhere:
            </Text>
          </Section>
          <Section style={styles.buttonWrapper}>
            <Button href={homeLink} style={styles.button}>
              Browse the latest
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Section>
            <Text style={styles.footnote}>{site}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function renderNewsletterWelcomeText({
  homeLink,
  site = "m4rkyu.com",
}: WelcomeProps): string {
  return [
    "M4RKYU.SYS — NEWSLETTER",
    "",
    `You're subscribed to ${site}. Occasional notes and logs, no noise.`,
    "",
    `Browse the latest: ${homeLink}`,
    "",
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
