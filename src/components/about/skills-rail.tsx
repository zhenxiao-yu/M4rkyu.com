import { Hexagon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Skills rail — grouped chip clusters per skill bucket. Tasteful, no
// fake levels. If `profile.skills` is empty, renders an empty-state
// hint so the page still reads cleanly during setup.
export async function SkillsRail({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "About.skills" });
  const groups = groupSkills(profile.skills);

  return (
    <Card className={cn("h-full bg-card/80", className)}>
      <CardHeader className="space-y-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-base">
          <Hexagon className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {groups.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/60 bg-background/40 p-4 text-xs leading-5 text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          groups.map(([group, items]) => (
            <div key={group} className="grid gap-2">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <Badge
                    key={`${group}-${skill.label}`}
                    variant="outline"
                    className="font-mono text-[0.6rem]"
                    title={skill.note}
                  >
                    {skill.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function groupSkills(skills: typeof profile.skills) {
  const map = new Map<string, typeof profile.skills>();
  for (const skill of skills) {
    const list = map.get(skill.group) ?? [];
    list.push(skill);
    map.set(skill.group, list);
  }
  return Array.from(map.entries());
}
