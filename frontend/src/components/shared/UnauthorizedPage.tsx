import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full flex flex-col items-center gap-6 p-8 bg-surface border border-border rounded-3xl shadow-lg"
      >
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight">Access Denied</h2>
          <p className="text-sm text-muted mt-2 font-medium">
            You do not have the required permissions to view this workspace. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="w-full py-3.5 rounded-xl bg-gradient-primary text-white font-bold flex items-center justify-center gap-2 text-sm shadow hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};
