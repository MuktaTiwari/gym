import React from "react";
import { useThemeStore } from "../../store/themeStore";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground hover:text-primary transition-all duration-200 outline-none flex items-center justify-center overflow-hidden shadow-sm"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" && (
          <motion.div
            key="light"
            initial={{ y: 15, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.15 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        )}
        {theme === "dark" && (
          <motion.div
            key="dark"
            initial={{ y: 15, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.15 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
        {theme === "system" && (
          <motion.div
            key="system"
            initial={{ y: 15, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.15 }}
          >
            <Monitor className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
