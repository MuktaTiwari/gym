import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { FloatingInput } from "../../components/ui/FloatingInput";
import { Button } from "../../components/ui/button";
import { axiosInstance } from "../../lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    planId: "",
    age: "",
    gender: "MALE",
    weight: "",
    height: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await axiosInstance.get("/plans");
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        planId: formData.planId || undefined,
        emergencyContact: formData.emergencyContact.name
          ? formData.emergencyContact
          : undefined,
      };

      await axiosInstance.post("/members", payload);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      onClose();
      setFormData({
        name: "",
        email: "",
        password: "",
        planId: "",
        age: "",
        gender: "MALE",
        weight: "",
        height: "",
        emergencyContact: {
          name: "",
          phone: "",
          relation: "",
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-bold">Add New Member</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content container */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Section 1: Credentials */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1.5">
                    Account Credentials
                  </h4>
                  <FloatingInput
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <FloatingInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />

                  <FloatingInput
                    label="Password (Optional)"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <p className="text-[10px] text-muted -mt-2">
                    Leave blank to auto-generate a secure password.
                  </p>
                </div>

                {/* Section 2: Membership Tier Plan */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1.5">
                    Membership Plan
                  </h4>
                  <div>
                    <label className="text-[11px] font-bold text-muted uppercase block mb-1">
                      Assign Membership Tier / Plan
                    </label>
                    <select
                      value={formData.planId}
                      onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200 font-semibold"
                    >
                      <option value="">No Plan Assigned (Pay As You Go)</option>
                      {plans.map((p: any) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - ${p.price} ({p.durationInMonths}mo)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 3: Physical Stats */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1.5">
                    Physical Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                    <div>
                      <label className="text-[11px] font-bold text-muted uppercase block mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                      label="Weight (kg)"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                    <FloatingInput
                      label="Height (cm)"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section 4: Emergency Contact */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1.5">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                      label="Contact Name"
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                    <FloatingInput
                      label="Relationship"
                      type="text"
                      value={formData.emergencyContact.relation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            relation: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <FloatingInput
                    label="Phone Number"
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          phone: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                {/* Footer Buttons inside the scroll container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6 text-sm font-bold"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full py-6 text-sm font-bold bg-gradient-primary hover:opacity-95"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Member"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
