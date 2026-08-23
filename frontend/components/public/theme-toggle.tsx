"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative rounded-full text-muted-foreground hover:text-foreground"
    >
      <SunIcon className="size-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
