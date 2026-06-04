import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { FloatingInput } from "../../components/ui/FloatingInput";
import { registerApi } from "./authApi";
import toast from "react-hot-toast";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("GYM_OWNER").default("GYM_OWNER"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "GYM_OWNER",
    },
  });

  const mutation = useMutation({
    mutationFn: registerApi,

    onSuccess: (data) => {
      toast.success("Successfully registered Super Admin!");
      setTimeout(() => {
        // Redirect to login with success state
        navigate("/login", { state: { registered: true, email: getValues("email") } });
      }, 1000);
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
          Platform Setup <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h2>
        <p className="text-muted mt-2 font-medium">
          Register the master Super Admin account to get started.
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
            label="Owner's Full Name"
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
                Registering...
              </>
            ) : (
              <>
                Register Super Admin
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
