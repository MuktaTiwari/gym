import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Users,
  Activity,
  CreditCard,
  Plus,
  ShieldCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  Lock
} from "lucide-react";

export const SuperAdminDashboard: React.FC = () => {
  const [search, setSearch] = useState("");

  const platformStats = [
    { label: "Total Gyms Registered", value: "24", icon: Building, color: "text-primary bg-primary/10" },
    { label: "Platform Members", value: "8,924", icon: Users, color: "text-accent bg-accent/10" },
    { label: "System Uptime", value: "99.98%", icon: Activity, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "MRR Platform-wide", value: "$4,800", icon: CreditCard, color: "text-emerald-400 bg-emerald-500/10" },
  ];

  const gymsData = [
    { id: "1", name: "Iron Paradise Gym", owner: "Dwayne Johnson", email: "dwayne@paradise.com", members: 420, plan: "Enterprise", status: "ACTIVE" },
    { id: "2", name: "Apex Fitness Studio", owner: "Sarah Connor", email: "sarah@apex.com", members: 184, plan: "Growth", status: "ACTIVE" },
    { id: "3", name: "Elite Powerlifting Club", owner: "Ed Coan", email: "ed@elite.com", members: 92, plan: "Basic", status: "OVERDUE" },
    { id: "4", name: "Gold's Strength Lab", owner: "Arnold S.", email: "arnold@golds.com", members: 310, plan: "Enterprise", status: "SUSPENDED" },
  ];

  const filteredGyms = gymsData.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-surface border border-border flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Super Administration Panel</h2>
            <p className="text-xs text-muted font-semibold mt-1">Platform management, tenant isolation, and billing analytics.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {platformStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-5 rounded-2xl bg-surface border border-border flex items-center gap-4 shadow-sm"
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border border-border shrink-0 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-black tracking-tight mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tenant List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-lg">Active Gym Tenants</h3>
            <p className="text-xs text-muted font-medium">Manage and monitor isolated gym databases</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search gyms or owners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {/* Create Tenant Button */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white font-extrabold text-xs shadow-sm hover:shadow transition-shadow">
              <Plus className="h-4 w-4" />
              <span>Add Gym</span>
            </button>
          </div>
        </div>

        {/* Custom Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                <th className="pb-4 pl-2">Gym Name</th>
                <th className="pb-4">Owner Name</th>
                <th className="pb-4">Active Members</th>
                <th className="pb-4">Subscription Plan</th>
                <th className="pb-4">System Status</th>
                <th className="pb-4 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredGyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-surface-hover/40 transition-colors">
                  <td className="py-4 pl-2 font-extrabold text-sm">{gym.name}</td>
                  <td className="py-4">
                    <p className="font-bold">{gym.owner}</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">{gym.email}</p>
                  </td>
                  <td className="py-4 font-semibold">{gym.members} members</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-surface font-extrabold border border-border">
                      {gym.plan}
                    </span>
                  </td>
                  <td className="py-4">
                    {gym.status === "ACTIVE" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[10px]">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    )}
                    {gym.status === "OVERDUE" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-[10px]">
                        <AlertTriangle className="h-3 w-3" />
                        Billing Overdue
                      </span>
                    )}
                    {gym.status === "SUSPENDED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-[10px]">
                        <Lock className="h-3 w-3" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex justify-end gap-2">
                      <button className="text-[10px] font-extrabold text-primary hover:text-primary-dark transition-colors">
                        Edit
                      </button>
                      <button className="text-[10px] font-extrabold text-destructive hover:opacity-80 transition-opacity">
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
