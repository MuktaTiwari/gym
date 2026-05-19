import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { loginApi } from "./authApi";
import { FloatingInput } from "../../components/ui/FloatingInput";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      // Navigate depending on role
      if (user.role === "SUPER_ADMIN") {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMessage(null);
    mutation.mutate(data);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
        <p className="text-muted mt-2 font-medium">
          Enter your credentials to access your dashboard.
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

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col gap-5">
        <motion.div variants={itemVariants}>
          <FloatingInput
            label="Email Address"
            type="email"
            autoComplete="new-email"
            error={errors.email?.message}
            {...register("email")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FloatingInput
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </motion.div>

        {/* Forgot password link */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Forgot your password?
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-2">
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.p variants={itemVariants} className="text-center text-sm text-muted font-medium mt-2">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-bold text-primary hover:text-primary-dark transition-colors"
        >
          Create one now
        </Link>
      </motion.p>
    </motion.div>
  );
};
