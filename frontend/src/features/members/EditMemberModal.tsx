import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Info } from "lucide-react";
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
import { axiosInstance } from "../../lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, member }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
    planId: "",
    assignedTrainerId: "",
    membershipEndDate: "",
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

  // Populate form data when member prop is loaded
  useEffect(() => {
    if (member) {
      const planIdStr = member.planId?._id || member.planId || "";
      const trainerIdStr = member.assignedTrainerId?._id || member.assignedTrainerId || "";
      const formattedEndDate = member.membershipEndDate
        ? new Date(member.membershipEndDate).toISOString().split("T")[0]
        : "";

      setFormData({
        name: member.fullName || member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        status: member.status || "ACTIVE",
        planId: planIdStr,
        assignedTrainerId: trainerIdStr || "unassigned",
        membershipEndDate: formattedEndDate,
        age: member.age !== undefined && member.age !== null ? String(member.age) : "",
        gender: member.gender || "MALE",
        weight: member.weight !== undefined && member.weight !== null ? String(member.weight) : "",
        height: member.height !== undefined && member.height !== null ? String(member.height) : "",
        emergencyContact: {
          name: member.emergencyContact?.name || "",
          phone: member.emergencyContact?.phone || "",
          relation: member.emergencyContact?.relation || "",
        },
      });
    }
  }, [member, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        fullName: formData.name,
        phone: formData.phone || undefined,
        status: formData.status,
        planId: formData.planId || undefined,
        assignedTrainerId: formData.assignedTrainerId === "unassigned" ? "" : formData.assignedTrainerId,
        membershipEndDate: formData.membershipEndDate || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        emergencyContact: formData.emergencyContact.name
          ? formData.emergencyContact
          : undefined,
      };

      await axiosInstance.put(`/members/${member._id}`, payload);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((p: any) => p._id === formData.planId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
          />

          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="relative bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] transition-colors duration-300"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-extrabold shadow-md">
                  U
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight transition-colors duration-300">
                    Update Member Profile
                  </h3>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 transition-colors duration-300">
                    Modify physical profile, subscription rates, emergency records, or staff logs.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-6 py-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Form Column (8cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Section 1: Credentials */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
                      Primary Details
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
                          placeholder="Emma Watson"
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
                          disabled
                          placeholder="emma@company.com"
                          value={formData.email}
                          className="mt-2 bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 019-2834"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-700 transition-all"
                        />
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
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Physical Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
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
                          placeholder="e.g. 26"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-450 transition-all"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-zinc-700 dark:text-zinc-300 font-medium block mb-2.5 transition-colors duration-300">
                          Gender
                        </Label>
                        <RadioGroup
                          value={formData.gender}
                          onValueChange={(val) => setFormData({ ...formData, gender: val })}
                          className="flex items-center gap-4 mt-1.5"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MALE" id="edit-g-male" className="accent-primary text-primary" />
                            <Label htmlFor="edit-g-male" className="text-zinc-800 dark:text-zinc-200 cursor-pointer">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FEMALE" id="edit-g-female" className="accent-primary text-primary" />
                            <Label htmlFor="edit-g-female" className="text-zinc-800 dark:text-zinc-200 cursor-pointer">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OTHER" id="edit-g-other" className="accent-primary text-primary" />
                            <Label htmlFor="edit-g-other" className="text-zinc-800 dark:text-zinc-200 cursor-pointer">Other</Label>
                          </div>
                        </RadioGroup>
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
                          step="0.1"
                          placeholder="e.g. 74.5"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all"
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
                          placeholder="e.g. 178"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Emergency Records */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-150 dark:border-zinc-850 pb-1.5 transition-colors duration-300">
                      Emergency Contacts
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ecName" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                          Contact Name
                        </Label>
                        <Input
                          id="ecName"
                          name="ecName"
                          placeholder="Parent / Spouse"
                          value={formData.emergencyContact.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                          })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ecRelation" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                          Relationship
                        </Label>
                        <Input
                          id="ecRelation"
                          name="ecRelation"
                          placeholder="e.g. Mother"
                          value={formData.emergencyContact.relation}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                          })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ecPhone" className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors duration-300">
                          Contact Phone
                        </Label>
                        <Input
                          id="ecPhone"
                          name="ecPhone"
                          placeholder="+1 (555) 014-9988"
                          value={formData.emergencyContact.phone}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                          })}
                          className="mt-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Summary Column (4cols) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Status Selection Card */}
                  <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                    <CardContent className="p-4 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-850 pb-1.5">
                        Membership Control
                      </h4>
                      <div>
                        <Label htmlFor="status" className="text-zinc-700 dark:text-zinc-300 font-semibold transition-colors duration-300">
                          Subscription Status
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(val) => setFormData({ ...formData, status: val })}
                        >
                          <SelectTrigger id="status" className="mt-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-bold">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PAUSED">Paused</SelectItem>
                            <SelectItem value="EXPIRED">Expired</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Membership Subscription Pricing Plan */}
                  <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                    <CardContent className="p-4 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-850 pb-1.5">
                        Subscription Tier
                      </h4>
                      
                      <div>
                        <Label htmlFor="planId" className="text-zinc-700 dark:text-zinc-300 font-semibold transition-colors duration-300">
                          Billing Rate Plan
                        </Label>
                        <Select
                          value={formData.planId}
                          onValueChange={(val) => setFormData({ ...formData, planId: val })}
                        >
                          <SelectTrigger id="planId" className="mt-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                            <SelectValue placeholder="Select Pricing Plan" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-h-[250px] overflow-y-auto">
                            {plans.map((p: any) => (
                              <SelectItem key={p._id} value={p._id}>
                                {p.name} (${p.price}/{p.durationInMonths}mo)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="membershipEndDate" className="text-zinc-700 dark:text-zinc-300 font-semibold transition-colors duration-300">
                          Membership Expiry Date
                        </Label>
                        <Input
                          id="membershipEndDate"
                          name="membershipEndDate"
                          type="date"
                          value={formData.membershipEndDate}
                          onChange={(e) => setFormData({ ...formData, membershipEndDate: e.target.value })}
                          className="mt-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>

                      {/* Display Selected Plan Summary */}
                      {selectedPlan && (
                        <div className="bg-white dark:bg-zinc-950 rounded-xl p-3 border border-zinc-150 dark:border-zinc-850 mt-4 transition-all">
                          <h5 className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1">
                            Pricing Details
                          </h5>
                          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 space-y-1">
                            <p className="flex justify-between">
                              <span className="text-zinc-400">Total Price:</span>
                              <span className="font-extrabold">${selectedPlan.price}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-zinc-400">Billing Type:</span>
                              <span className="font-extrabold uppercase">{selectedPlan.type}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-zinc-400">Duration:</span>
                              <span className="font-extrabold">{selectedPlan.durationInMonths} mo</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-150 dark:border-zinc-850 pt-4 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-primary hover:opacity-95 text-white shadow-md shadow-primary/10 rounded-xl font-bold text-xs uppercase transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-4.5 w-4.5 animate-spin" /> Saving Changes
                    </span>
                  ) : (
                    "Save Member Profile"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
