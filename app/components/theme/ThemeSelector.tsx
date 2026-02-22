"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (theme: Theme) => {
    const html = document.documentElement;
    html.classList.remove("dark");

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      }
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex gap-2">
      {(["light", "dark", "system"] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => changeTheme(t)}
          className={`px-3 py-1 rounded ${
            theme === t
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-gray-200 text-black dark:bg-gray-800 dark:text-white"
          }`}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
