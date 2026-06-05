import React, { useEffect } from "react";
import { useThemeStore } from "../../store/themeStore";
import type { Theme } from "../../store/themeStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, colorTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply Light/Dark Theme
    const applyTheme = (t: Theme) => {
      let activeTheme: "light" | "dark" = "light";
      
      if (t === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        activeTheme = systemTheme;
      } else {
        activeTheme = t;
      }

      root.setAttribute("data-theme", activeTheme);
      if (activeTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);
    
    // Apply Color Theme
    root.setAttribute("data-color-theme", colorTheme || "indigo");

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, colorTheme]);

  return <>{children}</>;
};
