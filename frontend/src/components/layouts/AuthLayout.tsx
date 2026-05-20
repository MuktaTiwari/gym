import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "../shared/ThemeToggle";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { BorderBeam } from "../ui/BorderBeam";

export const AuthLayout: React.FC = () => {
  return (
    <div
      className="min-h-screen relative w-full flex flex-col justify-between p-4 md:p-6 bg-cover bg-center overflow-x-hidden select-none font-sans transition-colors duration-500"
      style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop")`
      }}
    >
      {/* Dynamic theme responsive overlay with subtle blur for maximum readability */}
      <div className="absolute inset-0 bg-zinc-100/80 dark:bg-black/75 backdrop-blur-[3px] z-0 transition-colors duration-500" />

      {/* Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between mx-auto py-2">
        <Link to="/" className="flex items-center gap-2.5 text-zinc-900 dark:text-white transition-colors duration-500">
          <div className="h-9 w-9 rounded-xl bg-zinc-900/5 dark:bg-white/10 backdrop-blur-md flex items-center justify-center border border-zinc-900/10 dark:border-white/20 shadow-xs transition-all duration-500">
            <Dumbbell className="h-5 w-5 text-zinc-900 dark:text-white transition-colors duration-500" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white drop-shadow-xs transition-colors duration-500">FitCore</span>
        </Link>
        <div className="flex items-center gap-3 bg-zinc-900/5 dark:bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-900/10 dark:border-white/10 shadow-xs transition-all duration-500">
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Glassmorphic Authentication Card */}
      <main className="relative z-10 my-auto flex items-center justify-center w-full py-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col gap-6 overflow-hidden transition-all duration-500"
        >
          <BorderBeam size={350} duration={12} delay={9} colorFrom="hsl(var(--primary))" colorTo="hsl(var(--accent))" />

          {/* Subtle logo inside the card on smaller screens */}
          <div className="flex justify-center items-center gap-2.5 mb-2 md:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
              <Dumbbell className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-lg text-foreground">FitCore</span>
          </div>

          <Outlet />
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 w-full text-center text-zinc-600 dark:text-white/50 text-[11px] font-medium py-2 transition-colors duration-500">
        © {new Date().getFullYear()} FitCore Inc. All rights reserved. Empowered with elite SaaS infrastructure.
      </footer>
    </div>
  );
};

