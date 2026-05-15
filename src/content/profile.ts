import { profileSchema } from "./schemas";

export const profile = profileSchema.parse({
  name: "ZhenXiao Mark Yu",
  title: "Software engineer, frontend developer, game developer, digital artist",
  location: "Ontario, Canada",
  email: "markyu0615@gmail.com",
  intro:
    "Mark builds at the intersection of software, games, visual systems, and digital art. The remake frames that range as one coherent archive: serious engineering, cinematic restraint, and creative systems thinking.",
  timeline: [
    {
      label: "China to Canada",
      detail: "A cross-cultural path that informs the site's bilingual and editorial direction.",
      date: "2013 onward",
    },
    {
      label: "Western University",
      detail: "Software engineering foundation, research exposure, and systems thinking.",
      date: "University",
    },
    {
      label: "J.D. Power",
      detail: "Full-stack internship experience across Java, Spring Boot, data workflows, and UI work.",
      date: "2022-2023",
    },
  ],
  values: [
    "Clarity before spectacle",
    "Performance as a design material",
    "Accessible interfaces with atmosphere",
    "Creative tooling that feels precise",
  ],
  // Real socials live here. Empty entries get omitted in the footer
  // and the LetsBuild CTA — wire the handle and it shows up.
  socials: {
    github: "https://github.com/zhenxiao-yu",
    devto: "https://dev.to/zhenxiao_yu_a87bb6b2017f1",
    // linkedin: "https://linkedin.com/in/…",
    // bluesky: "https://bsky.app/profile/…",
    // twitter: "https://x.com/…",
    // instagram: "https://instagram.com/…",
  },
  // PDF lives at public/resume.pdf — show in footer as soon as the
  // file is uploaded. Until then, the footer renders the link with a
  // "pending" badge.
  resumeUrl: "/resume.pdf",
});
