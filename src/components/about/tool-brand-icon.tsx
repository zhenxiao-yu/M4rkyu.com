import type { SimpleIcon } from "simple-icons";
import {
  siApachekafka,
  siBlender,
  siCplusplus,
  siDocker,
  siEslint,
  siExpress,
  siFigma,
  siFramer,
  siGit,
  siGithubactions,
  siJavascript,
  siMdx,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siPrettier,
  siPython,
  siRadixui,
  siReact,
  siRedis,
  siRedux,
  siShadcnui,
  siSolidity,
  siSpringboot,
  siStorybook,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siUnity,
  siUnrealengine,
  siVuedotjs,
  siZod,
} from "simple-icons";
import { cn } from "@/lib/utils";

const iconMap: Record<string, SimpleIcon> = {
  JavaScript: siJavascript,
  React: siReact,
  Redux: siRedux,
  "Tailwind CSS": siTailwindcss,
  "Next.js": siNextdotjs,
  TypeScript: siTypescript,
  Vue: siVuedotjs,
  Motion: siFramer,
  "shadcn/ui": siShadcnui,
  "Radix UI": siRadixui,
  "Node.js": siNodedotjs,
  Express: siExpress,
  Java: siOpenjdk,
  "Spring Boot": siSpringboot,
  Kafka: siApachekafka,
  PostgreSQL: siPostgresql,
  MySQL: siMysql,
  MongoDB: siMongodb,
  Redis: siRedis,
  Python: siPython,
  Solidity: siSolidity,
  Supabase: siSupabase,
  Zod: siZod,
  MDX: siMdx,
  Storybook: siStorybook,
  ESLint: siEslint,
  Prettier: siPrettier,
  Git: siGit,
  "GitHub Actions": siGithubactions,
  Docker: siDocker,
  Unity: siUnity,
  "Unreal Engine": siUnrealengine,
  Blender: siBlender,
  "C++": siCplusplus,
  Figma: siFigma,
};

const monogramMap: Record<string, string> = {
  "C#": "C#",
  Illustrator: "Ai",
  Photoshop: "Ps",
  "Premiere Pro": "Pr",
  "UI/UX": "UX",
  Accessibility: "A11Y",
  Performance: "Perf",
  i18n: "i18n",
  "REST APIs": "API",
  Auth: "Auth",
  "React Email": "Mail",
  Playwright: "Pw",
  Photography: "Photo",
};

export function ToolBrandIcon({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const icon = iconMap[label];

  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background text-foreground",
        className,
      )}
      title={icon?.title ?? label}
      aria-hidden="true"
    >
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          role="img"
          focusable="false"
        >
          <path d={icon.path} fill="currentColor" />
        </svg>
      ) : (
        <span className="font-mono text-[0.58rem] font-semibold uppercase">
          {monogramMap[label] ?? fallbackMonogram(label)}
        </span>
      )}
    </span>
  );
}

function fallbackMonogram(label: string) {
  return label
    .split(/[\s./+-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
