import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "../shared/ThemeToggle";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { BorderBeam } from "../ui/BorderBeam";

export const AuthLayout: React.FC = () => {
  return (
    <div 
      className="min-h-screen relative w-full flex flex-col justify-between p-4 md:p-6 bg-cover bg-center overflow-x-hidden select-none font-sans"
      style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop")`
      }}
    >
      {/* Premium dark overlay with subtle blur for maximum readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] z-0" />

      {/* Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between mx-auto py-2">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm">FitCore</span>
        </Link>
        <div className="flex items-center gap-3 bg-white/10 dark:bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-white/10 shadow-sm">
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Glassmorphic Authentication Card */}
      <main className="relative z-10 my-auto flex items-center justify-center w-full py-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-background/95 dark:bg-surface/30 backdrop-blur-xl border border-border/50 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col gap-6 overflow-hidden"
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
      <footer className="relative z-10 w-full text-center text-white/50 text-[11px] font-medium py-2">
        © {new Date().getFullYear()} FitCore Inc. All rights reserved. Empowered with elite SaaS infrastructure.
      </footer>
    </div>
  );
};
