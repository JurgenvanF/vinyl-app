"use client";

import { useEffect } from "react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark");

  if (theme === "dark") {
    html.classList.add("dark");
    return;
  }

  if (
    theme === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    html.classList.add("dark");
  }
}

export default function ThemeInitializer() {
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    applyTheme(saved);
  }, []);

  return null;
}
