import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell,
  ShieldCheck,
  TrendingUp,
  Users,
  Award,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "../../components/shared/ThemeToggle";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            FitCore
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-sm font-extrabold text-muted hover:text-foreground transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-black text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all px-4 py-2 rounded-xl"
          >
            Join Now
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 z-10 relative flex flex-col gap-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Forging Elite Athletes</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
              UNLEASH YOUR <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">INNER CHAMPION</span>
            </h1>

            <p className="text-muted text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
              Experience the pinnacle of physical transformation. With world-class equipment, custom digital planning trackers, and elite trainers, your goals are just a workout away.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-primary hover:opacity-95 shadow-lg shadow-primary/10 transition-all"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-surface hover:bg-surface-hover border border-border transition-all"
              >
                Enter Member Hub
              </Link>
            </div>

            {/* Quick value counters */}
            <div className="grid grid-cols-3 gap-6 border-t border-border pt-8 mt-4 max-w-md">
              <div>
                <span className="text-2xl font-black block">1,200+</span>
                <span className="text-xs text-muted font-bold">Active Members</span>
              </div>
              <div>
                <span className="text-2xl font-black block">15+</span>
                <span className="text-xs text-muted font-bold">Elite Coaches</span>
              </div>
              <div>
                <span className="text-2xl font-black block">24/7</span>
                <span className="text-xs text-muted font-bold">Access Gates</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative p-8 rounded-3xl bg-surface border border-border shadow-2xl w-full max-w-[420px] flex flex-col justify-between h-96 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-5 mix-blend-color-dodge pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Open Pass
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-black text-muted uppercase tracking-wider">FitCore Digital Key</span>
                <h3 className="text-2xl font-black leading-tight text-foreground">
                  Transforming <br />
                  Habits Daily
                </h3>
                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Interactive Workout Logging</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Stripe Membership Checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center text-xs font-bold text-muted">
                <span>Scan at Gate</span>
                <Zap className="h-4 w-4 text-accent animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* FEATURES GRID */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black">Designed For Peak Consistency</h2>
            <p className="text-muted text-sm font-semibold">
              FitCore provides the ultimate, high-performance features required to streamline your training schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Premium Machinery",
                desc: "Equipped with state-of-the-art resistance and high-performance cardiovascular trainers.",
                icon: Dumbbell,
                color: "text-primary bg-primary/10 border-primary/20"
              },
              {
                title: "Digital Workout Log",
                desc: "Record your lifts, sets, reps, weight logs, and monitor progression analytics instantly.",
                icon: TrendingUp,
                color: "text-accent bg-accent/10 border-accent/20"
              },
              {
                title: "Group Scheduling",
                desc: "Reserve slots for Group HIIT circuits, Vinyasa flows, and heavy lifting classes in seconds.",
                icon: Users,
                color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
              },
              {
                title: "Security & Trust",
                desc: "Scanned QR code gate pass checkpoints, safe online payment billing ledgers, and secure profiles.",
                icon: ShieldCheck,
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between h-56 shadow-sm hover:border-primary/20 hover:y-[-4px] transition-all duration-200"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="font-extrabold text-base text-foreground">{feature.title}</h4>
                  <p className="text-xs text-muted font-semibold leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRICING PLANS */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black">All-Inclusive Memberships</h2>
            <p className="text-muted text-sm font-semibold">
              Select the package that matches your focus level and start crushing your goals today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Basic Access Plan",
                price: "$19",
                period: "per month",
                features: ["General Locker Access", "Cardio Deck Entry", "Standard Machinery", "Self Workout Logging"]
              },
              {
                name: "Combat Conditioning",
                price: "$79",
                period: "per month",
                features: ["24/7 Gate Scan Pass", "Group HIIT & Yoga Entry", "Premium Resistance Rigs", "Digital Class Booking"],
                popular: true
              },
              {
                name: "V.I.P. Platinum Elite",
                price: "$799",
                period: "per month",
                features: ["Private Personal Coach", "Unlimited Group Sessions", "Full Recover Spa Access", "Custom Nutrition Logs"]
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-surface border flex flex-col justify-between h-[420px] shadow-sm relative overflow-hidden transition-all ${
                  plan.popular ? "border-primary shadow-lg shadow-primary/5" : "border-border"
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-3 right-3 text-[9px] font-black text-white bg-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h4 className="font-extrabold text-sm text-muted uppercase tracking-wider">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-black text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted font-bold">{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-bold text-muted">
                        <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/register"
                  className={`w-full text-center py-2.5 rounded-xl font-bold text-xs transition-all ${
                    plan.popular
                      ? "text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10"
                      : "bg-surface-hover hover:bg-border/60 border border-border"
                  }`}
                >
                  Choose Package
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-border bg-surface/30 py-6 mt-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-muted">
          <span>&copy; {new Date().getFullYear()} FitCore Systems Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
