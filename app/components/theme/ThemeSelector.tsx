"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeSelector() {
  // track if component is mounted (to prevent SSR mismatch)
  const [mounted, setMounted] = useState(false);

  const [theme, setTheme] = useState<Theme>("system");

  // Apply theme to <html>
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
    // mark component as mounted
    setMounted(true);

    // read theme from localStorage after mount
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Render nothing until mounted to avoid SSR mismatch
  if (!mounted)
    return <div className="flex gap-2">{/* placeholder if needed */}</div>;

  return (
    <div className="flex gap-2">
      {(["light", "dark", "system"] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => changeTheme(t)}
          className={`px-3 py-1 rounded ${
            theme === t ? "bg-black text-white" : "bg-gray-200 text-black"
          }`}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
