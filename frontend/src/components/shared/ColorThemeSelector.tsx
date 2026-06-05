import React, { useState, useRef, useEffect } from "react";
import { useThemeStore, type ColorTheme } from "../../store/themeStore";
import { Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ColorThemeSelector: React.FC = () => {
  const { colorTheme, setColorTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const themes: { id: ColorTheme; name: string; colorClass: string }[] = [
    { id: "indigo", name: "Indigo Force", colorClass: "bg-indigo-500" },
    { id: "orange", name: "Orange Crush", colorClass: "bg-orange-500" },
    { id: "emerald", name: "Emerald Power", colorClass: "bg-emerald-500" },
    { id: "crimson", name: "Crimson Burn", colorClass: "bg-rose-600" },
    { id: "cyan", name: "Cyan Flow", colorClass: "bg-cyan-500" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover transition-colors flex items-center justify-center relative"
        aria-label="Select Color Theme"
      >
        <Palette className="h-5 w-5" />
        <span className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-surface ${themes.find(t => t.id === colorTheme)?.colorClass || "bg-indigo-500"}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-border bg-surface-hover/30">
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Accent Color</p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${colorTheme === theme.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-surface-hover"
                    }`}
                >
                  <span className={`h-4 w-4 rounded-full shadow-sm ${theme.colorClass}`} />
                  {theme.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
