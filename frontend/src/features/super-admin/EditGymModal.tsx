import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building, Loader2, CreditCard, Activity } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGymApi } from "./superAdminApi";
import toast from "react-hot-toast";

interface EditGymModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymData: any;
}

export const EditGymModal: React.FC<EditGymModalProps> = ({ isOpen, onClose, gymData }) => {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (gymData) {
      setName(gymData.name || "");
      setPlan(gymData.plan || "Standard");
      setStatus(gymData.status || "ACTIVE");
    }
  }, [gymData]);

  const mutation = useMutation({
    mutationFn: updateGymApi,
    onSuccess: () => {
      toast.success("Gym updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update Gym.";
      toast.error(msg);
    }
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border/50 overflow-hidden"
        >
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Edit Gym Settings
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ gymId: gymData.id, name, plan, status });
            }}
            className="p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Gym Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="E.g., Iron Paradise Gym"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subscription Plan</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  required
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
