import { Mail, Send } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { services } from "@/content/services";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="collaboration"
            title="Contact"
            description="Complete collaboration funnel layout with safe placeholder copy. Form provider is TBD, so email remains the production-safe path for now."
          />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="grid gap-5">
          {services.map((service) => (
            <Card key={service.slug} className="bg-card/80">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Project type</Badge>
                  <Badge variant="warning">{service.status}</Badge>
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.fit.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card/80">
          <CardHeader>
            <ContentPendingLabel label="FORM PROVIDER TBD" />
            <CardTitle>Project inquiry</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" aria-describedby="contact-form-note">
              <label className="grid gap-2 text-sm font-medium">
                Name
                <Input name="name" placeholder="Your name" autoComplete="name" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <Input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Project type
                <Input name="projectType" placeholder="Frontend system, app prototype, game UI..." />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Message
                <textarea
                  name="message"
                  rows={7}
                  className="min-h-36 rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Draft form: replace with final provider integration before launch."
                />
              </label>
              <p id="contact-form-note" className="text-sm leading-6 text-muted-foreground">
                Placeholder: this form is not wired to a backend yet. Use email until Resend, Tally,
                or Formspree is selected.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" disabled>
                  <Send className="size-4" />
                  Submit TBD
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="size-4" />
                    {profile.email}
                  </a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
