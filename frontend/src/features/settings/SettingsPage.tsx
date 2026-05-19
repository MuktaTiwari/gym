import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Users,
  Shield,
  CreditCard,
  Trash2,
  CheckCircle,
  Eye,
  Mail,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

type TabType = "profile" | "staff" | "billing" | "theme" | "danger";

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
}

const TAB_ITEMS: TabItem[] = [
  { id: "profile", label: "Gym Profile", icon: Building2 },
  { id: "staff", label: "Staff & Trainers", icon: Users },
  { id: "billing", label: "Tenant Billing", icon: CreditCard },
  { id: "theme", label: "Branding Theme", icon: Sun },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Gym state mock
  const [gymName, setGymName] = useState("Gold's Gym");
  const [address, setAddress] = useState("8000 Sunset Blvd, Los Angeles, CA");
  const [email, setEmail] = useState("owner@goldsgym.com");

  // Staff state mock
  const [staffList, setStaffList] = useState([
    { name: "Arnold Schwarzenegger", role: "GYM_OWNER", status: "ACTIVE" },
    { name: "Franco Columbu", role: "TRAINER", status: "ACTIVE" },
    { name: "Lou Ferrigno", role: "TRAINER", status: "PENDING" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TRAINER");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setStaffList([
      ...staffList,
      { name: inviteEmail.split("@")[0], role: inviteRole, status: "PENDING" },
    ]);
    setInviteEmail("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Gym Settings</h2>
        <p className="text-muted text-sm mt-1">
          Adjust platform tenant configurations, security levels, and custom themes.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-64 bg-surface border border-border p-3.5 rounded-2xl flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible shrink-0 gap-1.5 scrollbar-none">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none whitespace-nowrap ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted hover:text-foreground hover:bg-surface-hover/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTabLine"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full hidden lg:block"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content panel */}
        <div className="flex-1 w-full bg-surface border border-border p-6 rounded-2xl min-h-[400px]">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Gym Branding & Details</h3>
                <p className="text-muted text-xs">Configure the identity of your SaaS gym workspace tenant.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Gym Logo / Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border border-border bg-background flex items-center justify-center font-extrabold text-primary text-xl shadow-inner">
                      GG
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover text-xs font-bold transition-all">
                      Change Logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Gym Name</label>
                  <input
                    type="text"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Address Details</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>

                <button className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Staff & Trainer Matrix</h3>
                <p className="text-muted text-xs">Invite colleagues, administrators, and configure custom roles.</p>
              </div>

              {/* Invite Form */}
              <form onSubmit={handleInvite} className="bg-background border border-border p-4 rounded-xl flex flex-col md:flex-row items-end gap-3 max-w-2xl">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-muted block mb-1 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@goldsgym.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="w-full md:w-40">
                  <label className="text-[10px] font-bold text-muted block mb-1 uppercase">Role Level</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    <option value="GYM_ADMIN">Gym Admin</option>
                    <option value="TRAINER">Trainer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2.5 rounded-lg font-bold text-xs text-white bg-primary hover:opacity-95 transition-all shadow-sm shrink-0"
                >
                  Send Invitation
                </button>
              </form>

              {/* Roster list */}
              <div className="space-y-2 max-w-2xl">
                <h4 className="text-xs font-bold text-muted uppercase">Active Gym Personnel</h4>
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {staffList.map((staff, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-surface-hover/30 transition-all text-xs font-bold">
                      <div>
                        <span className="block text-foreground text-sm font-extrabold">{staff.name}</span>
                        <span className="text-[10px] text-muted font-mono">{staff.role}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase ${
                          staff.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {staff.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Tenant Stripe Billing</h3>
                <p className="text-muted text-xs">Verify invoices, view plan specs, and upgrade platform access.</p>
              </div>

              {/* Active Plan Card */}
              <div className="max-w-xl bg-gradient-primary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-5 translate-y-5">
                  <CreditCard className="h-48 w-48" />
                </div>
                
                <span className="text-[9px] font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  CURRENT SUITE SPEC
                </span>
                
                <h4 className="text-2xl font-black mt-2">FitCore Scale-Up Pro</h4>
                <p className="text-white/80 text-xs mt-1">Tenant subscription automatically renews on 2026-06-15.</p>

                <div className="border-t border-white/20 mt-6 pt-4 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="block text-white/60 font-bold">Billing Cycle</span>
                    <span className="font-extrabold">$149.00 / month</span>
                  </div>
                  <button className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-extrabold hover:opacity-95 shadow-sm transition-all">
                    Upgrade to Enterprise
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Branding Appearance</h3>
                <p className="text-muted text-xs">Adjust interface appearance styles for matching your gym aesthetic.</p>
              </div>

              <div className="space-y-4 max-w-sm">
                <span className="text-xs font-bold text-muted uppercase">Select Theme System Preference</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center gap-2 p-4 bg-background border border-primary rounded-xl text-xs font-bold text-primary transition-all">
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl text-xs font-bold text-muted hover:text-foreground transition-all">
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl text-xs font-bold text-muted hover:text-foreground transition-all">
                    <Monitor className="h-5 w-5" />
                    <span>System Sync</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-destructive animate-pulse">Danger Zone</h3>
                <p className="text-muted text-xs">High-risk actions regarding your active SaaS workspace account details.</p>
              </div>

              <div className="border border-destructive/20 bg-destructive/5 p-5 rounded-2xl space-y-4 max-w-xl">
                <h4 className="text-sm font-extrabold text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Deactivate Gym Workspace Tenant
                </h4>
                <p className="text-xs text-muted font-medium">
                  By deactivating your Gold&apos;s Gym workspace profile, all members log records, trainer timetables, and billing indexes will be permanently locked.
                </p>
                <button className="px-4 py-2.5 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive-dark text-white shadow-md shadow-destructive/10 transition-all duration-200">
                  Deactivate Tenant Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
