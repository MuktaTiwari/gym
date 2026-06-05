import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { setPasswordApi } from "./authApi";
import toast from "react-hot-toast";

export const SetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: setPasswordApi,
    onSuccess: () => {
      toast.success("Password set successfully! You can now log in.");
      navigate("/login");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to set password.";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing setup token.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    mutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">Invalid Link</h1>
        <p className="text-muted-foreground mb-8">
          The setup link is invalid or missing. Please check your email and try again.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-sm w-full mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-focus flex items-center justify-center shadow-xl shadow-primary/20 mb-8"
      >
        <ShieldCheck className="w-8 h-8 text-primary-foreground" />
      </motion.div>

      <div className="text-center mb-8 w-full">
        <h1 className="text-3xl font-black tracking-tight mb-2">Set Your Password</h1>
        <p className="text-muted-foreground font-medium">
          Create a strong password for your new FitCore account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border-2 border-border/50 rounded-xl py-3.5 pl-11 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
              placeholder="Min. 6 characters"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface border-2 border-border/50 rounded-xl py-3.5 pl-11 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group mt-6"
        >
          {mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Save Password
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
