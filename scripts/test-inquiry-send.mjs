// Throwaway end-to-end probe: fires one inquiry through Resend using
// the env values, proving the API key + sender + recipient triple is
// wired. Not committed.

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.INQUIRY_FROM_EMAIL;
const to = process.env.INQUIRY_TO_EMAIL;

if (!apiKey || !from || !to) {
  console.error("Missing env. Got:", {
    RESEND_API_KEY: Boolean(apiKey),
    INQUIRY_FROM_EMAIL: from || "(unset)",
    INQUIRY_TO_EMAIL: to || "(unset)",
  });
  process.exit(1);
}

console.log("Sending test inquiry...");
console.log(`  from: ${from}`);
console.log(`  to:   ${to}`);

const resend = new Resend(apiKey);
const result = await resend.emails.send({
  from,
  to,
  replyTo: "noreply@anthropic.com",
  subject: "Project inquiry — Domain verification probe",
  text: "If you got this, the verified-domain pipeline is wired. Safe to delete.",
});

if (result.error) {
  console.error("\n[FAIL]", result.error);
  process.exit(1);
}
console.log(`\n[OK] id=${result.data?.id}`);
