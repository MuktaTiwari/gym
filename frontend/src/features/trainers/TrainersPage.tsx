import React, { useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Award,
  Calendar,
  Users,
  X,
  Loader2,
  Dumbbell
} from "lucide-react";
import { memberApi } from "../dashboard/memberApi";
import type { Trainer } from "../dashboard/memberApi";
import { useAuthStore } from "../../store/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Simplified shift pattern — complexity reduced for SonarLint S5843
const SHIFT_PATTERN = /^([01]?\d):[0-5]\d\s*(AM|PM)\s*-\s*([01]?\d):[0-5]\d\s*(AM|PM)$|^[Oo]ff$/;

const trainerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be at most 80 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, or apostrophes"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[+]?[\d\s\-(]{7,15}$/.test(v),
      "Phone must be 7–15 digits and may include +, spaces, hyphens, or parentheses"
    ),
  specialization: z
    .string()
    .min(1, "Please select a specialization"),
  schedule: z.object({
    monday:    z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
    tuesday:   z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
    wednesday: z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
    thursday:  z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
    friday:    z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
    saturday:  z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
    sunday:    z.string().regex(SHIFT_PATTERN, 'Use format "HH:MM AM - HH:MM PM" or "Off"'),
  }),
});

type TrainerFormData = z.infer<typeof trainerSchema>;
type FormErrors = Partial<Record<keyof TrainerFormData | `schedule.${string}`, string>>;

const SPECIALIZATIONS = [
  "General Fitness",
  "Bodybuilding",
  "Weight Loss",
  "CrossFit",
  "Yoga & Pilates",
  "Strength & Conditioning",
  "Nutrition & Diet",
  "Cardio Training"
];

export const TrainersPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAuthorized = user?.role === "GYM_OWNER" || user?.role === "GYM_ADMIN";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "General Fitness",
    schedule: {
      monday: "09:00 AM - 05:00 PM",
      tuesday: "09:00 AM - 05:00 PM",
      wednesday: "09:00 AM - 05:00 PM",
      thursday: "09:00 AM - 05:00 PM",
      friday: "09:00 AM - 05:00 PM",
      saturday: "10:00 AM - 02:00 PM",
      sunday: "Off"
    }
  });

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: memberApi.getTrainers
  });

  const createMutation = useMutation({
    mutationFn: memberApi.createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Failed to onboard trainer.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Trainer> }) =>
      memberApi.updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Failed to update trainer profile.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: memberApi.deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    }
  });

  const resetForm = () => {
    setEditingTrainer(null);
    setErrorMsg("");
    setFormErrors({});
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      specialization: "General Fitness",
      schedule: {
        monday: "09:00 AM - 05:00 PM",
        tuesday: "09:00 AM - 05:00 PM",
        wednesday: "09:00 AM - 05:00 PM",
        thursday: "09:00 AM - 05:00 PM",
        friday: "09:00 AM - 05:00 PM",
        saturday: "10:00 AM - 02:00 PM",
        sunday: "Off"
      }
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trainer: Trainer) => {
    setErrorMsg("");
    setEditingTrainer(trainer);
    setFormData({
      fullName: trainer.fullName,
      email: trainer.email,
      phone: trainer.phone || "",
      specialization: trainer.specialization || "General Fitness",
      schedule: {
        monday: trainer.schedule?.monday || "09:00 AM - 05:00 PM",
        tuesday: trainer.schedule?.tuesday || "09:00 AM - 05:00 PM",
        wednesday: trainer.schedule?.wednesday || "09:00 AM - 05:00 PM",
        thursday: trainer.schedule?.thursday || "09:00 AM - 05:00 PM",
        friday: trainer.schedule?.friday || "09:00 AM - 05:00 PM",
        saturday: trainer.schedule?.saturday || "10:00 AM - 02:00 PM",
        sunday: trainer.schedule?.sunday || "Off"
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trainer? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFormErrors({});

    const result = trainerSchema.safeParse(formData);
    if (!result.success) {
      const mapped: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") as keyof FormErrors;
        if (!mapped[key]) mapped[key] = issue.message;
      }
      setFormErrors(mapped);
      return;
    }

    const validated: TrainerFormData = result.data;
    // Strip undefined optionals so the payload matches the required API shape
    const payload = Object.fromEntries(
      Object.entries(validated).filter(([, v]) => v !== undefined)
    ) as Omit<typeof validated, "phone"> & { phone?: string };

    if (editingTrainer) {
      updateMutation.mutate({ id: editingTrainer._id, data: payload });
    } else {
      createMutation.mutate(payload as Parameters<typeof createMutation.mutate>[0]);
    }
  };

  const scheduleDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-80 space-y-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted text-sm font-semibold animate-pulse">Loading active trainers...</p>
        </div>
      );
    }

    if (trainers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center bg-surface border border-border/50 p-12 rounded-2xl text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Dumbbell className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">No Trainers Found</h3>
            <p className="text-muted text-sm max-w-md mx-auto mt-1">
              You haven't onboarded any fitness trainers to your gym yet. Create one now to assign them to your members!
            </p>
          </div>
          {isAuthorized && (
            <Button
              onClick={handleOpenAdd}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-sm font-bold px-6 py-2.5 rounded-xl shadow transition-all"
            >
              Add Your First Trainer
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <motion.div
            layout
            key={trainer._id}
            className="bg-surface hover:bg-surface-hover/30 border border-border/50 hover:border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Badge for specialization */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full flex items-center justify-center pl-6 pb-6 pointer-events-none group-hover:bg-primary/10 transition-colors duration-300">
              <Dumbbell className="h-6 w-6 text-primary/25 group-hover:text-primary/50 transition-colors duration-300" />
            </div>

            <div>
              <div className="flex items-center gap-4">
                <img
                  src={trainer.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trainer.fullName)}`}
                  alt={trainer.fullName}
                  className="h-14 w-14 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-900 border border-border/40"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {trainer.fullName}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 inline-block mt-0.5">
                    ID: {trainer.trainerId}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm border-b border-border/40 pb-4">
                <div className="flex items-center gap-2.5 text-muted">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{trainer.specialization || "General Trainer"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{trainer.email}</span>
                </div>
                {trainer.phone && (
                  <div className="flex items-center gap-2.5 text-muted">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{trainer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-muted">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {trainer.assignedMembers?.length || 0} Members assigned
                  </span>
                </div>
              </div>

              {/* Schedule Quick Preview */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Weekly Shift</span>
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {scheduleDays.map((day) => {
                    const hours = trainer.schedule?.[day] || "Off";
                    const isOff = hours.toLowerCase() === "off";
                    return (
                      <div
                        key={day}
                        title={`${day.toUpperCase()}: ${hours}`}
                        className={`text-[10px] font-bold text-center py-1 rounded border transition-all select-none ${isOff
                          ? "bg-zinc-50 dark:bg-zinc-950/40 text-muted border-border/30"
                          : "bg-primary/5 text-primary border-primary/20"
                          }`}
                      >
                        {day.substring(0, 1).toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {isAuthorized && (
              <div className="flex gap-2.5 mt-6 border-t border-border/40 pt-4">
                <Button
                  onClick={() => handleOpenEdit(trainer)}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-1.5 hover:bg-surface-hover text-foreground font-semibold py-2 rounded-xl text-xs transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  onClick={() => handleDelete(trainer._id)}
                  variant="ghost"
                  className="flex items-center justify-center p-2 rounded-xl bg-destructive/5 hover:bg-destructive/10 border border-destructive/15 text-destructive hover:scale-105 transition-all"
                  title="Delete Trainer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 transition-all duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-hover/10 p-6 rounded-2xl border border-border/50">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Gym Trainers & Roster
          </h2>
          <p className="text-muted text-sm mt-1">
            Manage your personal trainers, specializations, weekly shifts, and active rosters.
          </p>
        </div>
        {isAuthorized && (
          <Button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-bold px-5 py-6 rounded-xl shadow-lg transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Onboard Trainer</span>
          </Button>
        )}
      </div>

      {renderContent()}

      {/* Onboard / Edit Trainer Modal Dialog (Framer Motion custom overlay) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-border w-full max-w-xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {editingTrainer ? "Update Trainer Profile" : "Onboard New Trainer"}
                  </h3>
                  <p className="text-muted text-xs mt-1">
                    {editingTrainer
                      ? `Modifying credentials and availability details for ${editingTrainer.fullName}.`
                      : "Onboard a new fitness trainer to your facility. They will become available to assign to members immediately."
                    }
                  </p>
                </div>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="ghost"
                  className="p-1.5 h-auto rounded-lg hover:bg-surface-hover transition-colors text-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl p-3 mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-xs font-semibold text-muted">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      className={`mt-2 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 ${
                        formErrors.fullName ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-[11px] text-destructive font-medium">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold text-muted">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john@fitcore.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`mt-2 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 ${
                        formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-[11px] text-destructive font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs font-semibold text-muted">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        setFormErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className={`mt-2 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 ${
                        formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-[11px] text-destructive font-medium">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialization" className="text-xs font-semibold text-muted">Fitness Specialization</Label>
                    <select
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => {
                        setFormData({ ...formData, specialization: e.target.value });
                        setFormErrors((prev) => ({ ...prev, specialization: undefined }));
                      }}
                      className={`mt-2 flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all cursor-pointer ${
                        formErrors.specialization ? "border-destructive" : ""
                      }`}
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec} className="bg-white dark:bg-zinc-950">
                          {spec}
                        </option>
                      ))}
                    </select>
                    {formErrors.specialization && (
                      <p className="mt-1 text-[11px] text-destructive font-medium">{formErrors.specialization}</p>
                    )}
                  </div>
                </div>

                {/* Shift Availability */}
                <div className="border-t border-border pt-5 space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-primary" />
                    <span>Weekly Shift Schedule</span>
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Provide the trainer's operational shift details for each weekday. Write "Off" if the trainer is unavailable on that day.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduleDays.map((day) => {
                      const scheduleKey = `schedule.${day}` as keyof FormErrors;
                      const dayError = formErrors[scheduleKey];
                      return (
                        <div key={day}>
                          <div className="flex items-center justify-between gap-3">
                            <Label htmlFor={`schedule-${day}`} className="capitalize text-xs font-semibold min-w-[70px] shrink-0 text-muted">
                              {day}
                            </Label>
                            <Input
                              id={`schedule-${day}`}
                              placeholder="e.g. 09:00 AM - 05:00 PM or Off"
                              value={formData.schedule[day]}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  schedule: { ...formData.schedule, [day]: e.target.value }
                                });
                                setFormErrors((prev) => ({ ...prev, [scheduleKey]: undefined }));
                              }}
                              className={`h-10 text-xs py-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 ${
                                dayError ? "border-destructive focus-visible:ring-destructive" : ""
                              }`}
                            />
                          </div>
                          {dayError && (
                            <p className="mt-1 text-[11px] text-destructive font-medium text-right">{dayError}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-6 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 px-8 font-semibold transition-all"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-50 dark:text-zinc-950 mr-2" />
                    )}
                    <span>{editingTrainer ? "Save Changes" : "Create Profile"}</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
