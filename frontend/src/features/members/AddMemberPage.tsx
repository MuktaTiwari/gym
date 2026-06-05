import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, Check, CircleCheck, Info, User,
  Dumbbell, Phone, Activity
} from "lucide-react";
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

export const AddMemberPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
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

  // Fetch Member Data if in Edit Mode
  useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/members/${id}`);
      const member = response.data.data;
      
      setFormData({
        name: member.fullName || member.name || "",
        email: member.email || "",
        password: "", // Never populate password on edit
        planId: member.planId || member.memberProfile?.planId || "",
        assignedTrainerId: member.assignedTrainerId || "unassigned",
        age: member.age || member.memberProfile?.age || "",
        gender: member.gender || member.memberProfile?.gender || "MALE",
        weight: member.weight || member.memberProfile?.weight || "",
        height: member.height || member.memberProfile?.height || "",
        emergencyContact: {
          name: member.emergencyContact?.name || member.memberProfile?.emergencyContact?.name || "",
          phone: member.emergencyContact?.phone || member.memberProfile?.emergencyContact?.phone || "",
          relation: member.emergencyContact?.relation || member.memberProfile?.emergencyContact?.relation || "",
        },
      });
      return member;
    },
    enabled: isEditMode,
  });

  const { data } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await axiosInstance.get("/plans");
      return response.data.data || { docs: [] };
    },
  });

  const { data: trainersData } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const response = await axiosInstance.get("/members/trainers");
      return response.data.data || [];
    },
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

      if (isEditMode) {
        // Exclude password if empty during edit
        if (!payload.password) delete payload.password;
        await axiosInstance.put(`/members/${id}`, payload);
      } else {
        await axiosInstance.post("/members", payload);
      }

      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member", id] });
      navigate("/dashboard/members");
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard/members")}
            className="h-10 w-10 rounded-full border border-border bg-surface hover:bg-surface-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {isEditMode ? "Edit Athlete Profile" : "Onboard New Athlete"}
            </h1>
            <p className="text-muted text-sm font-medium mt-1">
              {isEditMode ? "Update the member's details and subscription tier." : "Add a new member to your gym, select their plan, and configure their profile."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Forms */}
        <div className="xl:col-span-8 space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 border border-red-200/50 bg-red-50 dark:border-red-900/30 dark:bg-red-500/10 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-semibold text-sm shadow-sm"
            >
              <Info className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Section 1: Credentials */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Account Credentials</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-foreground">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    required
                    placeholder="Emma Crown"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-foreground">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="emma@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold text-foreground">
                    {isEditMode ? "New Password (Optional)" : "Password (Optional)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                  <p className="text-[11px] text-muted font-medium mt-1">
                    {isEditMode ? "Leave blank to keep existing password." : "Leave blank to email a secure setup link."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTrainerId" className="text-sm font-bold text-foreground">Assigned Trainer</Label>
                  <Select
                    value={formData.assignedTrainerId}
                    onValueChange={(val) => setFormData({ ...formData, assignedTrainerId: val })}
                  >
                    <SelectTrigger id="assignedTrainerId" className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl">
                      <SelectValue placeholder="Select a trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned (None)</SelectItem>
                      {trainersList.map((t: any) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.fullName} {t.specialization ? `(${t.specialization})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Physical Profile */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Physical Profile</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-bold text-foreground">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-bold text-foreground">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger id="gender" className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-bold text-foreground">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="74"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-bold text-foreground">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="181"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Emergency Contact */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Emergency Contact</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm font-bold text-foreground">Contact Name</Label>
                  <Input
                    id="contact-name"
                    placeholder="John Doe"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relation" className="text-sm font-bold text-foreground">Relationship</Label>
                  <Input
                    id="relation"
                    placeholder="Spouse, Parent"
                    value={formData.emergencyContact.relation}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                    })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-sm font-bold text-foreground">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                    className="bg-surface-hover h-11 px-4 border-border/50 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Membership Plan */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-surface-hover/30 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Membership Plan <span className="text-destructive">*</span></h3>
            </div>
            <CardContent className="p-6">
              <RadioGroup
                value={formData.planId}
                onValueChange={(val) => setFormData({ ...formData, planId: val })}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {planOptions.map((plan) => (
                  <label
                    key={plan._id}
                    htmlFor={plan._id || "pay-as-you-go"}
                    className={cn(
                      "relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300",
                      formData.planId === plan._id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border/50 bg-surface hover:bg-surface-hover hover:border-border"
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                        <RadioGroupItem value={plan._id} id={plan._id || "pay-as-you-go"} className="h-5 w-5" />
                      </div>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-foreground text-lg flex items-center">
                            {plan.name}
                            {plan._id === "" && (
                              <Badge variant="secondary" className="ml-3 h-5 px-2 text-[10px] uppercase">Flexible</Badge>
                            )}
                          </p>
                        </div>
                        <div className="mb-4">
                          <span className="text-2xl font-black text-primary">
                            {plan.price === 0 ? "Pay As You Go" : `$${plan.price}`}
                          </span>
                          {plan.durationInMonths > 0 && (
                            <span className="text-sm text-muted font-bold ml-1">/ {plan.durationInMonths}mo</span>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {plan.features.slice(0, 3).map((f, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted font-medium">
                              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="xl:col-span-4 relative">
          <div className="sticky top-24 space-y-6">
            <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
              <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-br from-surface to-surface-hover">
                <h3 className="font-black text-xl text-foreground">Summary</h3>
                <p className="text-muted text-sm font-medium mt-1">Review onboarding details</p>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-muted">Name</span>
                    <span className="text-sm font-black text-foreground truncate max-w-[150px]">
                      {formData.name || "-"}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-muted">Email</span>
                    <span className="text-sm font-black text-foreground truncate max-w-[150px]">
                      {formData.email || "-"}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-muted">Assigned Plan</span>
                    <span className="text-sm font-black text-primary">
                      {selectedPlan ? selectedPlan.name : "Pay As You Go"}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-muted">Billing Term</span>
                    <span className="text-sm font-black text-foreground">
                      {selectedPlan && selectedPlan.durationInMonths > 0
                        ? `${selectedPlan.durationInMonths} Month(s)`
                        : "Contract Free"}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-muted">Renewal Date</span>
                    <span className="text-sm font-black text-foreground">
                      {selectedPlan && selectedPlan.durationInMonths > 0
                        ? getRenewalDate(selectedPlan.durationInMonths)
                        : "N/A"}
                    </span>
                  </div>
                </div>
                
                <div className="bg-surface-hover p-6">
                  <div className="space-y-3 mb-6">
                    {!isEditMode && (
                      <div className="flex items-start gap-2">
                        <CircleCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-muted">Generates credentials automatically</span>
                      </div>
                    )}
                    {!isEditMode && (
                      <div className="flex items-start gap-2">
                        <CircleCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-muted">Sends welcome email & login link</span>
                      </div>
                    )}
                    {isEditMode && (
                      <div className="flex items-start gap-2">
                        <CircleCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-muted">Updates member records instantly</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-border/50 flex justify-between items-center mb-6">
                    <span className="text-sm font-black text-foreground uppercase tracking-wider">Total Due Today</span>
                    <span className="text-3xl font-black text-foreground">
                      ${selectedPlan ? selectedPlan.price : 0}
                    </span>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {isEditMode ? "Saving..." : "Provisioning Account..."}</>
                    ) : (
                      isEditMode ? "Save Changes" : "Complete Onboarding"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
