import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ThemeToggle } from "../shared/ThemeToggle";
import { ColorThemeSelector } from "../shared/ColorThemeSelector";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  UserCheck
} from "lucide-react";
import { logoutApi } from "../../features/auth/authApi";

export const DashboardLayout: React.FC = () => {
  const { user, logoutAction } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      logoutAction();
      navigate("/login");
    }
  };

  const getNavItems = () => {
    const role = user?.role;

    if (role === "SUPER_ADMIN") {
      return [
        { label: "Overview", path: "/super-admin", icon: LayoutDashboard },
        { label: "Manage Gyms", path: "/super-admin/gyms", icon: Users },
        { label: "Settings", path: "/super-admin/settings", icon: Settings },
      ];
    }

    if (role === "GYM_OWNER" || role === "GYM_ADMIN") {
      return [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Members", path: "/dashboard/members", icon: Users },
        { label: "Trainers", path: "/dashboard/trainers", icon: Dumbbell },
        { label: "Plans", path: "/dashboard/plans", icon: FileText },
        { label: "Classes", path: "/dashboard/classes", icon: Calendar },
        { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
        { label: "Settings", path: "/dashboard/settings", icon: Settings },
      ];
    }

    if (role === "TRAINER") {
      return [
        { label: "Trainer Portal", path: "/dashboard", icon: LayoutDashboard },
        { label: "My Classes", path: "/dashboard/classes", icon: Calendar },
        { label: "Assigned Members", path: "/dashboard/members", icon: Users },
      ];
    }

    // Default Member navigation
    return [
      { label: "My Fitness Hub", path: "/dashboard", icon: LayoutDashboard },
      { label: "Book Classes", path: "/dashboard/classes", icon: Calendar },
      { label: "My Attendance", path: "/dashboard/attendance", icon: UserCheck },
      { label: "Payments History", path: "/dashboard/payments", icon: CreditCard },
    ];
  };

  const navItems = getNavItems();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "GYM_OWNER":
        return "bg-primary/10 text-primary border-primary/20";
      case "GYM_ADMIN":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "TRAINER":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-accent/10 text-accent border-accent/20";
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden transition-all duration-300">
      {/* Sidebar: Desktop */}
      <aside className="hidden lg:flex h-full w-72 bg-surface border-r border-border flex-col justify-between p-6 shrink-0 relative z-30">
        <div className="flex flex-col gap-8">
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              FitCore
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                    isActive
                      ? "text-primary bg-primary/5 border border-primary/15"
                      : "text-muted hover:text-foreground hover:bg-surface-hover border border-transparent"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-primary" : "text-muted group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute right-0 w-1 h-6 rounded-l-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-surface-hover flex items-center justify-center border border-border text-primary font-bold text-lg">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-extrabold text-sm truncate">{user?.name}</h4>
              <span
                className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleColor(
                  user?.role || ""
                )}`}
              >
                {user?.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header bar */}
        <header className="h-20 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 flex items-center justify-between px-6 z-20 transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="font-extrabold text-xl tracking-tight hidden md:block">
              {location.pathname === "/dashboard" ? "Main Workspace" : "Management Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ColorThemeSelector />
              <ThemeToggle />
            </div>
            <div className="h-8 w-[1px] bg-border hidden md:block" />

            {/* Profile Menu Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-hover transition-colors">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Dropdown panel */}
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border shadow-xl opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
                <div className="p-3 border-b border-border">
                  <p className="font-semibold text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to={user?.role === "SUPER_ADMIN" ? "/super-admin/settings" : "/dashboard/settings"}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted" />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 overflow-y-auto mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 bg-surface border-r border-border p-6 flex flex-col justify-between z-50 lg:hidden"
            >
              <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                      FitCore
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-surface-hover"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          isActive
                            ? "text-primary bg-primary/5 border border-primary/10"
                            : "text-muted hover:text-foreground hover:bg-surface-hover"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User footer */}
              <div className="flex flex-col gap-4 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-surface-hover flex items-center justify-center border border-border text-primary font-bold text-lg">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-extrabold text-sm truncate">{user?.name}</h4>
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleColor(
                        user?.role || ""
                      )}`}
                    >
                      {user?.role.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/10 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
