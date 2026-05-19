import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ArrowRight, Loader2, AlertCircle, Sparkles, Building, UserCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { registerApi } from "./authApi";
import { FloatingInput } from "../../components/ui/FloatingInput";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["GYM_OWNER", "MEMBER"], { required_error: "Role is required" }),
  gymName: z.string().optional(),
}).refine((data) => {
  if (data.role === "GYM_OWNER" && (!data.gymName || data.gymName.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Gym name is required for gym owners",
  path: ["gymName"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "MEMBER",
      gymName: "",
    },
  });

  const selectedRole = watch("role");

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      // Registration successful, standard UX is to redirect to login
      // but let's make it sign them in automatically if the backend returns tokens,
      // or redirect to login page with a success query param.
      // Since our backend returns the registered user in response, let's redirect them to login with a friendly message.
      navigate("/login", { state: { registered: true, email: watch("email") } });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Registration failed. Please check your inputs.";
      setErrorMessage(msg);
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setErrorMessage(null);
    mutation.mutate(data);
  };

  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col gap-6"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
          Get started <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h2>
        <p className="text-muted mt-2 font-medium">
          Create an account and set up your profile.
        </p>
      </motion.div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="new-email" className="flex flex-col gap-4">
        {/* Full Name */}
        <motion.div variants={itemVariants}>
          <FloatingInput
            label="Full Name"
            autoComplete="new-name"
            error={errors.name?.message}
            {...register("name")}
          />
        </motion.div>

        {/* Email Address */}
        <motion.div variants={itemVariants}>
          <FloatingInput
            label="Email Address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <FloatingInput
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
        </motion.div>

        {/* Interactive Role Card Selection */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">
            Choose Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Member Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setValue("role", "MEMBER")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${selectedRole === "MEMBER"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface hover:bg-surface-hover text-muted hover:text-foreground"
                }`}
            >
              <UserCheck className="h-6 w-6" />
              <span className="font-extrabold text-sm">Gym Member</span>
            </motion.div>

            {/* Owner Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setValue("role", "GYM_OWNER")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${selectedRole === "GYM_OWNER"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface hover:bg-surface-hover text-muted hover:text-foreground"
                }`}
            >
              <Building className="h-6 w-6" />
              <span className="font-extrabold text-sm">Gym Owner</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Conditional Gym Name field */}
        <AnimatePresence mode="wait">
          {selectedRole === "GYM_OWNER" && (
            <motion.div
              key="gymNameField"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-1">
                <FloatingInput
                  label="Gym or Facility Name"
                  error={errors.gymName?.message}
                  {...register("gymName")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 px-6 rounded-xl bg-gradient-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.p variants={itemVariants} className="text-center text-sm text-muted font-medium mt-1">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-primary hover:text-primary-dark transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
};
