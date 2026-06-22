import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { AdminForm } from "@/components/admin/admin-form";
import type { AdminActionState } from "@/lib/admin/action-state";
import type { Profile } from "@/content/schemas";

// Single-row settings editor for the site profile. Server component —
// all interactivity flows through native form submission to
// updateProfileAction. Scalars + socials are normal inputs; the
// nested arrays are authored as validated JSON textareas, so the
// form never drifts from `profileSchema`.

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Labels {
  save: string;
  cancel: string;
  savedHint: string;
  required: string;
  structuredHint: string;
  jsonHint: string;
  section: {
    identity: string;
    intro: string;
    socials: string;
    structured: string;
  };
  nameLabel: string;
  titleLabel: string;
  locationLabel: string;
  emailLabel: string;
  githubHandleLabel: string;
  resumeUrlLabel: string;
  introLabel: string;
  socialGithubLabel: string;
  socialDevtoLabel: string;
  socialLinkedinLabel: string;
  socialBlueskyLabel: string;
  socialTwitterLabel: string;
  socialInstagramLabel: string;
  socialMastodonLabel: string;
  socialFacebookLabel: string;
  socialYoutubeLabel: string;
  socialCodepenLabel: string;
  socialSpotifyLabel: string;
  socialSnapchatLabel: string;
  socialWechatLabel: string;
  socialDiscordLabel: string;
  socialBuymeacoffeeLabel: string;
  timelineLabel: string;
  valuesLabel: string;
  skillsLabel: string;
  citiesLabel: string;
  currentlyLabel: string;
  portraitsLabel: string;
}

export function ProfileForm({
  action,
  profile,
  labels,
  successMessage,
  cancelHref,
}: {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  profile: Profile;
  labels: Labels;
  successMessage: string;
  cancelHref: string;
}) {
  const socials = profile.socials ?? {};

  return (
    <AdminForm
      action={action}
      draftKey="profile"
      submitLabel={labels.save}
      cancelLabel={labels.cancel}
      cancelHref={cancelHref}
      successMessage={successMessage}
    >
      <Section title={labels.section.identity}>
        <Row cols={2}>
          <Field label={labels.nameLabel} name="name" defaultValue={profile.name} required />
          <Field label={labels.titleLabel} name="title" defaultValue={profile.title} required />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.locationLabel}
            name="location"
            defaultValue={profile.location}
            required
          />
          <Field
            label={labels.emailLabel}
            name="email"
            type="email"
            defaultValue={profile.email}
            required
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.githubHandleLabel}
            name="githubHandle"
            defaultValue={profile.githubHandle ?? ""}
          />
          <Field
            label={labels.resumeUrlLabel}
            name="resumeUrl"
            defaultValue={profile.resumeUrl ?? ""}
          />
        </Row>
      </Section>

      <Section title={labels.section.intro}>
        <Field
          label={labels.introLabel}
          name="intro"
          defaultValue={profile.intro}
          multiline
          rows={4}
          required
        />
      </Section>

      <Section title={labels.section.socials}>
        <Row cols={2}>
          <Field
            label={labels.socialGithubLabel}
            name="socialGithub"
            type="url"
            defaultValue={socials.github ?? ""}
          />
          <Field
            label={labels.socialDevtoLabel}
            name="socialDevto"
            type="url"
            defaultValue={socials.devto ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialLinkedinLabel}
            name="socialLinkedin"
            type="url"
            defaultValue={socials.linkedin ?? ""}
          />
          <Field
            label={labels.socialBlueskyLabel}
            name="socialBluesky"
            type="url"
            defaultValue={socials.bluesky ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialTwitterLabel}
            name="socialTwitter"
            type="url"
            defaultValue={socials.twitter ?? ""}
          />
          <Field
            label={labels.socialInstagramLabel}
            name="socialInstagram"
            type="url"
            defaultValue={socials.instagram ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialMastodonLabel}
            name="socialMastodon"
            type="url"
            defaultValue={socials.mastodon ?? ""}
          />
          <Field
            label={labels.socialFacebookLabel}
            name="socialFacebook"
            type="url"
            defaultValue={socials.facebook ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialYoutubeLabel}
            name="socialYoutube"
            type="url"
            defaultValue={socials.youtube ?? ""}
          />
          <Field
            label={labels.socialCodepenLabel}
            name="socialCodepen"
            type="url"
            defaultValue={socials.codepen ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialSpotifyLabel}
            name="socialSpotify"
            type="url"
            defaultValue={socials.spotify ?? ""}
          />
          <Field
            label={labels.socialSnapchatLabel}
            name="socialSnapchat"
            type="url"
            defaultValue={socials.snapchat ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialWechatLabel}
            name="socialWechat"
            type="text"
            defaultValue={socials.wechat ?? ""}
          />
          <Field
            label={labels.socialDiscordLabel}
            name="socialDiscord"
            type="text"
            defaultValue={socials.discord ?? ""}
          />
        </Row>
        <Row cols={2}>
          <Field
            label={labels.socialBuymeacoffeeLabel}
            name="socialBuymeacoffee"
            type="url"
            defaultValue={socials.buymeacoffee ?? ""}
          />
        </Row>
      </Section>

      <Section title={labels.section.structured}>
        <p className="text-[0.7rem] text-muted-foreground/80">{labels.structuredHint}</p>
        <Field
          label={labels.timelineLabel}
          name="timelineJson"
          defaultValue={JSON.stringify(profile.timeline, null, 2)}
          hint={labels.jsonHint}
          multiline
          rows={10}
        />
        <Field
          label={labels.valuesLabel}
          name="valuesJson"
          defaultValue={JSON.stringify(profile.values, null, 2)}
          hint={labels.jsonHint}
          multiline
          rows={8}
        />
        <Field
          label={labels.skillsLabel}
          name="skillsJson"
          defaultValue={JSON.stringify(profile.skills, null, 2)}
          hint={labels.jsonHint}
          multiline
          rows={12}
        />
        <Field
          label={labels.citiesLabel}
          name="citiesJson"
          defaultValue={JSON.stringify(profile.cities, null, 2)}
          hint={labels.jsonHint}
          multiline
          rows={12}
        />
        <Field
          label={labels.currentlyLabel}
          name="currentlyJson"
          defaultValue={JSON.stringify(profile.currently, null, 2)}
          hint={labels.jsonHint}
          multiline
          rows={10}
        />
        <Field
          label={labels.portraitsLabel}
          name="portraitsJson"
          defaultValue={JSON.stringify(profile.portraits, null, 2)}
          hint={labels.jsonHint}
          multiline
          rows={8}
        />
      </Section>

    </AdminForm>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 rounded-lg border border-border/60 bg-card/60 p-5">
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Row({ cols, children }: { cols: 2 | 3; children: ReactNode }) {
  return (
    <div
      className={
        cols === 2 ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 md:grid-cols-3"
      }
    >
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  multiline,
  rows,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows ?? 4}
          required={required}
          spellCheck={false}
          className={`${inputClass} font-mono text-[0.78rem] leading-5`}
        />
      ) : (
        <Input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          autoComplete="off"
        />
      )}
      {hint ? (
        <span className="text-[0.7rem] text-muted-foreground/70">{hint}</span>
      ) : null}
    </label>
  );
}
