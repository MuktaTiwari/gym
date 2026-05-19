import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Check, X, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";

const planSchema = z.object({
  name: z.string().min(3, "Plan name must be at least 3 characters"),
  type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"]),
  price: z.number().min(0, "Price must be a positive number"),
  durationInMonths: z.number().min(1, "Duration must be at least 1"),
  features: z.string().min(5, "Please list at least one feature (separated by comma)"),
  isPopular: z.boolean().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

export const PlansPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  const isAuthorized = user?.role === "GYM_OWNER" || user?.role === "GYM_ADMIN";

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await axiosInstance.get("/plans");
      return response.data.data || [];
    },
    enabled: isAuthorized,
  });

  const createMutation = useMutation({
    mutationFn: async (newPlan: any) => {
      await axiosInstance.post("/plans", newPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await axiosInstance.put(`/plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      isPopular: false,
      type: "MONTHLY",
      durationInMonths: 1,
    },
  });

  const onOpenAdd = () => {
    setEditingPlan(null);
    reset({
      name: "",
      price: 29,
      type: "MONTHLY",
      durationInMonths: 1,
      features: "",
      isPopular: false,
    });
    setIsModalOpen(true);
  };

  const onOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    reset({
      name: plan.name,
      price: plan.price,
      type: plan.type,
      durationInMonths: plan.durationInMonths,
      features: plan.features ? plan.features.join(", ") : "",
      isPopular: !!plan.isPopular,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: PlanFormValues) => {
    const parsedFeatures = data.features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      ...data,
      features: parsedFeatures,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleActiveStatus = (plan: any) => {
    updateMutation.mutate({ id: plan._id, data: { isActive: !plan.isActive } });
  };

  if (!isAuthorized) {
    return <div className="p-6 text-destructive">You do not have permission to view plans.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Membership Tier Rates</h2>
          <p className="text-muted text-sm mt-1">
            Build packages, adjust pricing schedules, and control tenant billing catalogs.
          </p>
        </div>
        <button
          onClick={onOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Plan</span>
        </button>
      </div>

      {/* Plans responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <div
            key={plan._id}
            className={`relative flex flex-col justify-between bg-surface border rounded-3xl p-6 transition-all duration-300 ${
              plan.isPopular
                ? "shadow-lg shadow-primary/5 scale-102 border-transparent before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-primary before:-z-10 before:content-['']"
                : "border-border shadow-sm hover:shadow-md"
            }`}
          >
            {/* Header section */}
            <div>
              {plan.isPopular && (
                <span className="absolute -top-3.5 left-6 text-white text-[10px] font-extrabold px-3 py-1 bg-gradient-primary rounded-full shadow-sm tracking-wider uppercase">
                  Most Popular
                </span>
              )}
              
              <div className="absolute top-4 right-4 flex gap-1">
                <button
                  onClick={() => {
                    if(window.confirm("Are you sure you want to delete this plan?")) {
                      deleteMutation.mutate(plan._id);
                    }
                  }}
                  className="p-1.5 hover:bg-destructive/10 text-muted hover:text-destructive rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-between items-start mt-2">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">{plan.name}</h3>
                  <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-background border uppercase">
                    {plan.type}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-extrabold text-primary">${plan.price}</span>
                  <span className="text-muted text-xs">/{plan.durationInMonths}mo</span>
                </div>
              </div>

              {/* Members tally */}
              <div className="flex items-center gap-2 mt-4 text-xs font-bold text-muted bg-background/50 border border-border/60 rounded-xl px-3 py-2">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Active members API needed</span>
              </div>

              {/* Features list */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-extrabold text-muted uppercase tracking-wider">Plan Highlights</h4>
                <ul className="space-y-2.5">
                  {plan.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEdit(plan)}
                  className="p-2 hover:bg-surface-hover rounded-xl text-muted hover:text-foreground border border-transparent hover:border-border transition-all duration-200"
                  title="Edit Tier info"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              {/* Toggle switch for active/inactive */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase ${plan.isActive ? "text-emerald-500" : "text-muted"}`}>
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleActiveStatus(plan)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    plan.isActive ? "bg-emerald-500" : "bg-muted/40"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      plan.isActive ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 relative z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {editingPlan ? "Edit Membership Tier" : "Create New Tier"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-surface-hover rounded-lg text-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Plan Package Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="e.g. VIP Strength Elite"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">Rate Billing Cycle</label>
                    <select
                      {...register("type")}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200 font-semibold"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="SEMI_ANNUAL">Semi-Annual</option>
                      <option value="ANNUAL">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      {...register("durationInMonths", { valueAsNumber: true })}
                      placeholder="e.g. 1"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                    />
                    {errors.durationInMonths && <p className="text-destructive text-xs mt-1 font-semibold">{errors.durationInMonths.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Price Rate ($)</label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="e.g. 79"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  {errors.price && <p className="text-destructive text-xs mt-1 font-semibold">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">
                    Tier Features list (Comma-separated)
                  </label>
                  <textarea
                    {...register("features")}
                    placeholder="Unlimited cardio access, weekly lockers, guest pass..."
                    rows={4}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all duration-200 resize-none"
                  />
                  {errors.features && (
                    <p className="text-destructive text-xs mt-1 font-semibold">{errors.features.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" id="isPopular" {...register("isPopular")} className="rounded border-border accent-primary h-4 w-4" />
                  <label htmlFor="isPopular" className="text-xs font-bold text-foreground select-none cursor-pointer">
                    Flag as &quot;Most Popular&quot; / Best Seller
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm bg-surface hover:bg-surface-hover border border-border transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2.5 flex items-center justify-center rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Plan"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
