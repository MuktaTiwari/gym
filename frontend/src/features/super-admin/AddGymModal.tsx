import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building, User, Mail, Lock, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGymApi } from "./superAdminApi";
import toast from "react-hot-toast";

interface AddGymModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGymModal: React.FC<AddGymModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addGymApi,
    onSuccess: () => {
      toast.success("Gym and Owner created successfully!");
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
      onClose();
      // Reset form
      setName("");
      setOwnerName("");
      setOwnerEmail("");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create Gym.";
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
              Register New Gym
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ name, ownerName, ownerEmail });
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
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="E.g., John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Owner Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>



            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-xl font-medium border border-input hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-2 px-4 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Add Gym"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
