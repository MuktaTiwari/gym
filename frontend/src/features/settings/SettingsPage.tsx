import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Users,
  CreditCard,
  Trash2,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { gymApi, type GymProfile, type GymSettings, type StaffMember } from "./gymApi";

// ────── Types ──────
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
  const queryClient = useQueryClient();

  // ────── Queries ──────
  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({ queryKey: ["gymProfile"], queryFn: gymApi.getProfile });

  const {
    data: settings,
    isLoading: settingsLoading,
  } = useQuery({ queryKey: ["gymSettings"], queryFn: gymApi.getSettings });

  const {
    data: staff,
    isLoading: staffLoading,
  } = useQuery({ queryKey: ["gymStaff"], queryFn: gymApi.getStaff });

  // ────── Local Form State ──────
  const [gymName, setGymName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TRAINER");

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setGymName(profile.name ?? "");
      setAddress(profile.address ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
      setCity(profile.city ?? "");
      setCountry(profile.country ?? "");
    }
  }, [profile]);

  // ────── Mutations ──────
  const updateProfileMutation = useMutation({
    mutationFn: gymApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["gymProfile"], data);
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: gymApi.uploadLogo,
    onSuccess: (data) => {
      queryClient.setQueryData(["gymProfile"], data);
    },
  });

  const inviteStaffMutation = useMutation({
    mutationFn: gymApi.inviteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gymStaff"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: gymApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["gymSettings"], data);
    },
  });

  // ────── Handlers ──────
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Omit<GymProfile, "_id" | "logo">> = {
      name: gymName,
      address,
      email,
      phone,
      city,
      country,
    };
    updateProfileMutation.mutate(payload);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      uploadLogoMutation.mutate(file);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteStaffMutation.mutate({ email: inviteEmail, role: inviteRole });
    setInviteEmail("");
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTheme = (document.querySelector('input[name="theme"]:checked') as HTMLInputElement)?.value as any;
    const payload: Partial<GymSettings> = { theme: selectedTheme };
    updateSettingsMutation.mutate(payload);
  };

  // Loading state
  if (profileLoading || settingsLoading || staffLoading) {
    return <div className="p-8 text-center">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Gym Settings</h2>
        <p className="text-muted text-sm mt-1">Adjust platform tenant configurations, security levels, and custom themes.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tab List */}
        <div className="w-full lg:w-64 bg-surface border border-border p-3.5 rounded-2xl flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible shrink-0 gap-1.5 scrollbar-none">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none whitespace-nowrap ${
                  isActive ? "text-primary bg-primary/10" : "text-muted hover:text-foreground hover:bg-surface-hover/50"
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

        {/* Content */}
        <div className="flex-1 w-full bg-surface border border-border p-6 rounded-2xl min-h-[400px]">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} className="space-y-6 max-w-md">
              <h3 className="text-lg font-extrabold tracking-tight">Gym Branding & Details</h3>
              <p className="text-muted text-xs">Configure the identity of your SaaS gym workspace tenant.</p>
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Gym Logo / Avatar</label>
                <div className="flex items-center gap-4">
                  {profile?.logo ? (
                    <img src={profile.logo} alt="Gym logo" className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl border border-border bg-background flex items-center justify-center font-extrabold text-primary text-xl shadow-inner">
                      GG
                    </div>
                  )}
                  <label htmlFor="logoUpload" className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover text-xs font-bold cursor-pointer transition-all">
                    Change Logo
                    <input id="logoUpload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="gymName" className="text-xs font-bold text-muted block mb-1">Gym Name</label>
                <input id="gymName" type="text" value={gymName} onChange={(e) => setGymName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="email" className="text-xs font-bold text-muted block mb-1">Contact Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="phone" className="text-xs font-bold text-muted block mb-1">Phone Number</label>
                <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="address" className="text-xs font-bold text-muted block mb-1">Address Details</label>
                <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="text-xs font-bold text-muted block mb-1">City</label>
                  <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200" />
                </div>
                <div>
                  <label htmlFor="country" className="text-xs font-bold text-muted block mb-1">Country</label>
                  <input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200" />
                </div>
              </div>
              <button type="submit" className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving…" : "Save Changes"}
              </button>
            </form>
          )}

          {/* Staff Tab */}
          {activeTab === "staff" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold tracking-tight">Staff & Trainer Matrix</h3>
              <p className="text-muted text-xs">Invite colleagues, administrators, and configure custom roles.</p>
              <form onSubmit={handleInvite} className="bg-background border border-border p-4 rounded-xl flex flex-col md:flex-row items-end gap-3 max-w-2xl">
                <div className="flex-1 w-full">
                  <label htmlFor="inviteEmail" className="text-[10px] font-bold text-muted block mb-1 uppercase">Email Address</label>
                  <input id="inviteEmail" type="email" placeholder="name@gym.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all" />
                </div>
                <div className="w-full md:w-40">
                  <label htmlFor="inviteRole" className="text-[10px] font-bold text-muted block mb-1 uppercase">Role Level</label>
                  <select id="inviteRole" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold">
                    <option value="GYM_ADMIN">Gym Admin</option>
                    <option value="TRAINER">Trainer</option>
                  </select>
                </div>
                <button type="submit" className="w-full md:w-auto px-4 py-2.5 rounded-lg font-bold text-xs text-white bg-primary hover:opacity-95 transition-all shadow-sm shrink-0" disabled={inviteStaffMutation.isPending}>
                  {inviteStaffMutation.isPending ? "Inviting…" : "Send Invitation"}
                </button>
              </form>
              <div className="space-y-2 max-w-2xl">
                <h4 className="text-xs font-bold text-muted uppercase">Active Gym Personnel</h4>
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {staff?.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-3.5 hover:bg-surface-hover/30 transition-all text-xs font-bold">
                      <div>
                        <span className="block text-foreground text-sm font-extrabold">{s.name}</span>
                        <span className="text-[10px] text-muted font-mono">{s.role}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase ${s.role === "GYM_ADMIN" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                          {s.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold tracking-tight">Tenant Stripe Billing</h3>
              <p className="text-muted text-xs">Verify invoices, view plan specs, and upgrade platform access.</p>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === "theme" && (
            <form onSubmit={handleSettingsSave} className="space-y-6 max-w-sm">
              <h3 className="text-lg font-extrabold tracking-tight">Branding Appearance</h3>
              <p className="text-muted text-xs">Adjust interface appearance styles for matching your gym aesthetic.</p>
              <span className="text-xs font-bold text-muted uppercase">Select Theme System Preference</span>
              <div className="grid grid-cols-3 gap-3">
                {(["light", "dark", "system"] as const).map((mode) => (
                  <label key={mode} className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl text-xs font-bold cursor-pointer transition-all">
                    {mode === "light" && <Sun className="h-5 w-5" />}
                    {mode === "dark" && <Moon className="h-5 w-5" />}
                    {mode === "system" && <Monitor className="h-5 w-5" />}
                    <span className="capitalize">{mode} Mode</span>
                    <input type="radio" name="theme" value={mode} defaultChecked={settings?.theme === mode} className="hidden" />
                  </label>
                ))}
              </div>
              <button type="submit" className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:opacity-95 transition-all" disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? "Saving…" : "Save Theme"}
              </button>
            </form>
          )}

          {/* Danger Tab */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold tracking-tight text-destructive animate-pulse">Danger Zone</h3>
              <p className="text-muted text-xs">High-risk actions regarding your active SaaS workspace account details.</p>
              <div className="border border-destructive/20 bg-destructive/5 p-5 rounded-2xl space-y-4 max-w-xl">
                <h4 className="text-sm font-extrabold text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Deactivate Gym Workspace Tenant
                </h4>
                <p className="text-xs text-muted font-medium">Deactivating will permanently lock all member logs, trainer timetables, and billing indexes.</p>
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
