import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, CheckCircle, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardDataApi, suspendGymApi } from "./superAdminApi";
import { Button } from "../../components/ui/button";
import { AddGymModal } from "./AddGymModal";
import { EditGymModal } from "./EditGymModal";
import { ConfirmSuspendModal } from "./ConfirmSuspendModal";

export const SuperAdminManageGyms: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [gymToSuspend, setGymToSuspend] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-dashboard"],
    queryFn: getDashboardDataApi,
  });

  const dashboardData = data?.data;
  const gymsData = dashboardData?.gyms || [];

  const filteredGyms = gymsData.filter((g: any) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.owner.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
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
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-primary text-white font-extrabold text-xs shadow-sm hover:shadow transition-shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Gym</span>
            </Button>
          </div>
        </div>

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
              {filteredGyms.map((gym: any) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGym(gym);
                          setIsEditModalOpen(true);
                        }}
                        className="text-[10px] font-extrabold text-primary hover:text-primary-dark transition-colors"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGymToSuspend(gym);
                          setIsConfirmModalOpen(true);
                        }}
                        className={`text-[10px] font-extrabold transition-opacity ${gym.status === "SUSPENDED" ? "text-emerald-500 hover:text-emerald-600" : "text-destructive hover:opacity-80"}`}
                      >
                        {gym.status === "SUSPENDED" ? "Activate" : "Suspend"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGyms.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">No gyms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AddGymModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditGymModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} gymData={selectedGym} />
      <ConfirmSuspendModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} gymData={gymToSuspend} />
    </div>
  );
};
