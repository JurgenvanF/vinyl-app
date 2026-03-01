"use client";

import { useEffect, useState } from "react";

const getIsDark = () => {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

export function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    setIsDark(getIsDark());

    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function useThemePlaceholder() {
  const isDark = useIsDarkTheme();
  return isDark ? "/placeholder-dark.png" : "/placeholder.png";
}

