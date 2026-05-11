import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { InquiryPayload } from "@/lib/forms/inquiry-schema";

interface InquiryEmailProps {
  payload: InquiryPayload;
  /**
   * Plain "Mon DD, YYYY · HH:MM UTC" timestamp baked at send time so
   * the rendered HTML is fully static — no Date() calls inside React
   * Email's render path.
   */
  receivedAt: string;
}

/**
 * Transactional template for /contact inquiries.
 *
 * Intentional English-only. The email lands in Mark's inbox where
 * filters and quick-reply muscle memory are EN; the *site UX* is
 * bilingual but the back-channel email is not.
 *
 * Styled with inline styles (no Tailwind) so it survives email-client
 * sanitisation. Colours mirror the light-theme palette in globals.css.
 */
export function InquiryEmail({ payload, receivedAt }: InquiryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${payload.name} — ${payload.projectType}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.eyebrow}>M4RKYU.SYS · INQUIRY</Text>
            <Heading style={styles.heading}>{payload.projectType}</Heading>
            <Text style={styles.metaLine}>
              {payload.name} · {payload.email}
            </Text>
            <Text style={styles.metaLine}>{receivedAt}</Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>Message</Text>
            <Text style={styles.message}>{payload.message}</Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.footnote}>
              Reply directly to this email — the From address is set to
              the sender so your reply lands in their inbox.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Plaintext fallback. Modern clients render the HTML, but text/plain
 * keeps deliverability up and helps screen readers / Apple Mail
 * "summary" extractors. Mirrors the visible content order.
 */
export function renderInquiryText({ payload, receivedAt }: InquiryEmailProps): string {
  return [
    `M4RKYU.SYS — INQUIRY`,
    ``,
    payload.projectType,
    `${payload.name} <${payload.email}>`,
    receivedAt,
    ``,
    `Message`,
    `———————`,
    payload.message,
    ``,
    `Reply directly — the From header is set to the sender.`,
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
  metaLine: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "13px",
    color: "#5f5f5f",
    margin: "0 0 4px 0",
  },
  hr: {
    borderColor: "#e9e7e0",
    margin: "24px 0",
  },
  label: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "#5f5f5f",
    margin: "0 0 8px 0",
  },
  message: {
    fontSize: "15px",
    lineHeight: "1.65",
    color: "#0a0a0a",
    margin: 0,
    whiteSpace: "pre-wrap" as const,
  },
  footnote: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#5f5f5f",
    margin: 0,
  },
};
