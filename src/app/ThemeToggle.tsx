"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useHasMounted } from "@/lib/use-has-mounted";
import { Tooltip } from "@/app/Tooltip";

/** The "shifter" — dark is the declared default (see
 * .claude/docs/DESIGN_LANGUAGE.md, "Theming"), this is the explicit manual
 * override, not tied to OS preference (enableSystem={false} in layout.tsx).
 * Tooltip matches every other icon-only header control now that the whole
 * toolbar was made consistent in one pass. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) return <div className="h-8 w-8" />;

  const isLight = resolvedTheme === "light";
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <Tooltip label={label}>
      <button
        onClick={() => setTheme(isLight ? "dark" : "light")}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/70 hover:text-foreground"
      >
        {isLight ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </Tooltip>
  );
}
