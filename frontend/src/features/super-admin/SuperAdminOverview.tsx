import React from "react";
import { motion } from "framer-motion";
import { Building, Users, Activity, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardDataApi } from "./superAdminApi";

export const SuperAdminOverview: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-dashboard"],
    queryFn: getDashboardDataApi,
  });

  const dashboardData = data?.data;

  const platformStats = [
    { label: "Total Gyms Registered", value: dashboardData?.platformStats?.totalGyms || "0", icon: Building, color: "text-primary bg-primary/10" },
    { label: "Platform Members", value: dashboardData?.platformStats?.totalMembers || "0", icon: Users, color: "text-accent bg-accent/10" },
    { label: "System Uptime", value: dashboardData?.platformStats?.uptime || "100%", icon: Activity, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "MRR Platform-wide", value: dashboardData?.platformStats?.mrr || "$0", icon: CreditCard, color: "text-emerald-400 bg-emerald-500/10" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
    </div>
  );
};
