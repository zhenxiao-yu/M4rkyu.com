interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-[700] leading-[1.05] tracking-normal text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
