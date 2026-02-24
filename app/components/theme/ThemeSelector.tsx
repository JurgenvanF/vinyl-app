"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  function applyTheme(theme: Theme) {
    const html = document.documentElement;
    html.classList.remove("dark");

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      }
    }
  }

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const cycleTheme = () => {
    const nextTheme: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  if (!mounted) return null;

  const renderIcon = () => {
    if (theme === "light") return <Sun size={20} />;
    if (theme === "dark") return <Moon size={20} />;
    return <Monitor size={20} />;
  };

  return (
    <button
      onClick={cycleTheme}
      className="py-1 rounded transition-colors duration-300 cursor-pointer"
    >
      {renderIcon()}
    </button>
  );
}
