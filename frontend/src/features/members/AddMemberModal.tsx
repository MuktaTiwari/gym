import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, CircleCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { axiosInstance } from "../../lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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
    assignedTrainerId: "",
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

  const { data } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await axiosInstance.get("/plans");
      return response.data.data || { docs: [] };
    },
    enabled: isOpen,
  });

  const { data: trainersData } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const response = await axiosInstance.get("/members/trainers");
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const plans = data?.docs || [];
  const trainersList = trainersData || []; 

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
        assignedTrainerId: formData.assignedTrainerId === "unassigned" ? undefined : (formData.assignedTrainerId || undefined),
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
        assignedTrainerId: "",
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

  const selectedPlan = plans.find((p: any) => p._id === formData.planId);

  const getRenewalDate = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const planOptions = [
    {
      _id: "",
      name: "Pay As You Go",
      price: 0,
      durationInMonths: 0,
      features: [
        "Pay per session attended",
        "Standard locker room access",
        "Access during off-peak hours",
      ],
    },
    ...plans.map((p: any) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      durationInMonths: p.durationInMonths,
      features: p.features || [
        "Full access to gym equipment",
        "Free locker room & showers",
        "1 Free training consultation",
        "Access during all working hours",
      ],
    })),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Theme responsive overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-40 transition-colors duration-300"
            onClick={onClose}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/50 transition-colors duration-300">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 transition-colors duration-300">Add New Athlete</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors duration-300">Onboard a member and configure their subscription tier.</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content container */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin">
                {error && (
                  <div className="mb-6 p-4 border border-red-200 dark:border-red-900/50 text-sm text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-center gap-2.5">
                    <Info className="h-5 w-5 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                  
                  {/* Left Column: Form Inputs */}
                  <div className="lg:col-span-7 space-y-8">
                    
                    {/* Section 1: Credentials */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
                        Account Credentials
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Full Name<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            required
                            placeholder="Emma Crown"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Email Address<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="emma@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Password (Optional)
                          </Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 transition-colors duration-300">
                            Leave blank to automatically generate a secure access password.
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="assignedTrainerId" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Assigned Trainer
                          </Label>
                          <Select
                            value={formData.assignedTrainerId}
                            onValueChange={(val) => setFormData({ ...formData, assignedTrainerId: val })}
                          >
                            <SelectTrigger id="assignedTrainerId" className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all">
                              <SelectValue placeholder="Select trainer" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-h-[200px] overflow-y-auto">
                              <SelectItem value="unassigned">Unassigned (None)</SelectItem>
                              {trainersList.map((t: any) => (
                                <SelectItem key={t._id} value={t._id}>
                                  {t.fullName} {t.specialization ? `(${t.specialization})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 transition-colors duration-300">
                            Select a trainer to assign to this member's roster.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Physical Details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
                        Physical Profile
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Age
                          </Label>
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            placeholder="28"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Gender
                          </Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(val) => setFormData({ ...formData, gender: val })}
                          >
                            <SelectTrigger id="gender" className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weight" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Weight (kg)
                          </Label>
                          <Input
                            id="weight"
                            name="weight"
                            type="number"
                            placeholder="74"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Height (cm)
                          </Label>
                          <Input
                            id="height"
                            name="height"
                            type="number"
                            placeholder="181"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Emergency Contact */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
                        Emergency Contact
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact-name" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Contact Name
                          </Label>
                          <Input
                            id="contact-name"
                            name="contact-name"
                            placeholder="e.g. John Doe"
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
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="relation" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                            Relationship
                          </Label>
                          <Input
                            id="relation"
                            name="relation"
                            placeholder="Spouse, Parent"
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
                            className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contact-phone" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                          Phone Number
                        </Label>
                        <Input
                          id="contact-phone"
                          name="contact-phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
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
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                        />
                      </div>
                    </div>

                    {/* Section 4: Membership Tier Plan */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
                        Membership Plan<span className="text-red-500">*</span>
                      </h4>

                      <RadioGroup
                        value={formData.planId}
                        onValueChange={(val) => setFormData({ ...formData, planId: val })}
                        className="mt-4 space-y-3"
                      >
                        {planOptions.map((plan) => (
                          <label
                            key={plan._id}
                            htmlFor={plan._id || "pay-as-you-go"}
                            className={cn(
                              "relative block cursor-pointer rounded-lg border p-4 transition-all duration-300",
                              formData.planId === plan._id
                                ? "border-zinc-500 ring-1 ring-zinc-500 bg-zinc-50 dark:bg-zinc-900/80"
                                : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                                <RadioGroupItem value={plan._id} id={plan._id || "pay-as-you-go"} className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
                              </div>
                              <div className="w-full">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-none transition-colors duration-300">
                                    {plan.name}
                                    {plan._id === "" && (
                                      <Badge variant="secondary" className="ml-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-transparent text-[10px] px-1.5 py-0.5 transition-colors">
                                        Flexible
                                      </Badge>
                                    )}
                                  </p>
                                  <div>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
                                      {plan.price === 0 ? "Pay As You Go" : `$${plan.price}`}
                                    </span>
                                    {plan.durationInMonths > 0 && (
                                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500"> / {plan.durationInMonths}mo</span>
                                    )}
                                  </div>
                                </div>
                                <ul className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                  {plan.features.map((f, index) => (
                                    <li key={index} className="flex items-center gap-1.5 text-xs text-zinc-650 dark:text-zinc-400 transition-colors duration-300">
                                      <Check className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600 shrink-0 transition-colors duration-300" aria-hidden="true" />
                                      <span className="truncate">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                  </div>

                  {/* Right Column: Member Summary Card */}
                  <div className="lg:col-span-5">
                    <Card className="bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 sticky top-4 h-fit transition-all duration-300">
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
                            Member Summary
                          </h4>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
                            Review information and pricing terms before activation.
                          </p>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div className="flex justify-between py-1 border-b border-zinc-150 dark:border-zinc-850 transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400">Name</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[170px] transition-colors">
                              {formData.name || <span className="text-zinc-400 dark:text-zinc-600">Enter name...</span>}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-150 dark:border-zinc-850 transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400">Email</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[170px] transition-colors">
                              {formData.email || <span className="text-zinc-400 dark:text-zinc-600">Enter email...</span>}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-150 dark:border-zinc-850 transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400">Plan Assigned</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 transition-colors">
                              {selectedPlan ? selectedPlan.name : "Pay As You Go"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-150 dark:border-zinc-850 transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400">Billing Term</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 transition-colors">
                              {selectedPlan && selectedPlan.durationInMonths > 0
                                ? `${selectedPlan.durationInMonths} Month(s)`
                                : "Contract Free"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-150 dark:border-zinc-850 transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400">Renewal Date</span>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 transition-colors">
                              {selectedPlan && selectedPlan.durationInMonths > 0
                                ? getRenewalDate(selectedPlan.durationInMonths)
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-zinc-150 dark:bg-zinc-855" />

                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider transition-colors">
                            Onboarding Checklist
                          </h4>
                          <ul className="space-y-2.5">
                            <li className="flex items-start space-x-2 text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
                              <CircleCheck className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0 transition-colors" />
                              <span>Generates credentials automatically</span>
                            </li>
                            <li className="flex items-start space-x-2 text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
                              <CircleCheck className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0 transition-colors" />
                              <span>Assigns initial physical assessment</span>
                            </li>
                            <li className="flex items-start space-x-2 text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
                              <CircleCheck className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0 transition-colors" />
                              <span>Links member profile to gym branch</span>
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 transition-all duration-300">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-zinc-500 dark:text-zinc-400 transition-colors">Total Due Today</span>
                            <span className="text-zinc-900 dark:text-zinc-50 text-lg font-bold transition-colors">
                              ${selectedPlan ? selectedPlan.price : 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>

                {/* Footer Section */}
                <Separator className="my-8 bg-zinc-150 dark:bg-zinc-850" />
                <div className="flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                    className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 border-transparent px-6 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 px-8 font-semibold transition-all"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-50 dark:text-zinc-950" />
                    ) : (
                      "Add Member"
                    )}
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
