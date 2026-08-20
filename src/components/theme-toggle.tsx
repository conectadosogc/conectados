"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("conectados-theme", theme);
  document.cookie = `conectados-theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light",
  );

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
      aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
    >
      {isDark ? <Sun className="h-4 w-4 text-[var(--mustard)]" /> : <Moon className="h-4 w-4 text-[var(--indigo)]" />}
      {isDark ? "Claro" : "Oscuro"}
    </button>
  );
}
