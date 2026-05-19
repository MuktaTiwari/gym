import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Dumbbell, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { FloatingInput } from "../../components/ui/FloatingInput";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    setIsSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
      <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="font-extrabold text-xl tracking-tight">FitCore</span>
      </div>

      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-extrabold tracking-tight">Reset password</h2>
        <p className="text-muted mt-2 font-medium">
          We'll send you an email with password recovery instructions.
        </p>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-emerald-500">Email Sent!</h3>
            <p className="text-muted text-sm mt-1 font-medium">
              Please check your inbox for instructions to reset your password.
            </p>
          </div>
          <Link
            to="/login"
            className="mt-2 text-sm font-extrabold text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <FloatingInput
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-md transition-shadow text-sm"
            >
              Send Instructions
              <Send className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="text-center mt-2">
            <Link
              to="/login"
              className="text-sm font-extrabold text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
};
