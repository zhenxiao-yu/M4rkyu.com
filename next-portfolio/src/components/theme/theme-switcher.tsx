"use client";

import { Moon, Sun, CircleDot } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const themes = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "monochrome", label: "Mono", icon: CircleDot },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-1 rounded-md border bg-background/70 p-1 backdrop-blur">
        {themes.map((item) => {
          const Icon = item.icon;
          const active = theme === item.value;
          return (
            <Tooltip key={item.value}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={active ? "secondary" : "ghost"}
                  size="icon"
                  aria-label={`Use ${item.label} theme`}
                  aria-pressed={active}
                  data-testid={`theme-${item.value}`}
                  onClick={() => setTheme(item.value)}
                >
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
