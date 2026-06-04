import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suspendGymApi } from "./superAdminApi";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

interface ConfirmSuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymData: any;
}

export const ConfirmSuspendModal: React.FC<ConfirmSuspendModalProps> = ({ isOpen, onClose, gymData }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: suspendGymApi,
    onSuccess: (data) => {
      toast.success(data.message || "Gym status updated.");
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update gym status.");
    }
  });

  if (!isOpen || !gymData) return null;

  const isSuspended = gymData.status === "SUSPENDED";
  const actionText = isSuspended ? "activate" : "suspend";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border/50 overflow-hidden"
        >
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${isSuspended ? 'text-emerald-500' : 'text-destructive'}`} />
              Confirm Action
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm">
              Are you sure you want to <strong className={isSuspended ? 'text-emerald-500' : 'text-destructive'}>{actionText}</strong> the gym <strong>{gymData.name}</strong>?
            </p>
            {isSuspended ? (
              <p className="text-xs text-muted-foreground">
                This will immediately restore access to the tenant's owner and members.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This will immediately revoke access for all members and staff associated with this tenant.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(gymData.id)}
                className={`flex-1 rounded-xl text-white ${isSuspended ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-destructive hover:bg-destructive/90'}`}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Yes, ${actionText}`
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
