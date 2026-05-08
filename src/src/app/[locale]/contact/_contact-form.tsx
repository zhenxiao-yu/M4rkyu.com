"use client"

import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FormState = {
  name: string
  email: string
  projectType: string
  message: string
}

type Errors = Partial<Record<keyof FormState, string>>

const initialState: FormState = {
  name: "",
  email: "",
  projectType: "",
  message: "",
}

function validate(values: FormState): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = "Add your name."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Use a valid email address."
  }
  if (!values.projectType.trim()) errors.projectType = "Add the kind of project."
  if (values.message.trim().length < 20) {
    errors.message = "Add at least 20 characters so the idea has enough context."
  }
  return errors
}

export function ContactForm({ email }: { email: string }) {
  const [values, setValues] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Errors>({})
  const mailto = useMemo(() => {
    const subject = values.projectType.trim()
      ? `Project inquiry: ${values.projectType.trim()}`
      : "Project inquiry"
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Project type: ${values.projectType}`,
      "",
      values.message,
    ].join("\n")
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [email, values])

  function updateField(field: keyof FormState, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      window.location.href = mailto
    }
  }

  return (
    <form className="grid gap-5" aria-describedby="contact-form-note" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-medium">
        Name
        <Input
          name="name"
          placeholder="Your name…"
          autoComplete="name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <span id="contact-name-error" className="text-xs text-destructive" aria-live="polite">
            {errors.name}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <Input
          name="email"
          type="email"
          placeholder="you@example.com…"
          autoComplete="email"
          spellCheck={false}
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <span id="contact-email-error" className="text-xs text-destructive" aria-live="polite">
            {errors.email}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Project Type
        <Input
          name="projectType"
          placeholder="Frontend system, app prototype, game UI…"
          autoComplete="off"
          value={values.projectType}
          onChange={(event) => updateField("projectType", event.target.value)}
          aria-invalid={Boolean(errors.projectType)}
          aria-describedby={errors.projectType ? "contact-project-type-error" : undefined}
        />
        {errors.projectType ? (
          <span id="contact-project-type-error" className="text-xs text-destructive" aria-live="polite">
            {errors.projectType}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Message
        <textarea
          name="message"
          rows={7}
          className="min-h-36 rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell me the goal, timeline, and what you already have…"
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <span id="contact-message-error" className="text-xs text-destructive" aria-live="polite">
            {errors.message}
          </span>
        ) : null}
      </label>
      <p id="contact-form-note" className="text-sm leading-6 text-muted-foreground">
        This opens a prefilled email for now. A server-side provider can replace it when launch
        workflow is ready.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          <Send className="size-4" aria-hidden="true" />
          Prepare Email
        </Button>
        <Button asChild variant="outline">
          <a href={`mailto:${email}`}>
            <Mail className="size-4" aria-hidden="true" />
            Email Directly
          </a>
        </Button>
      </div>
    </form>
  )
}
