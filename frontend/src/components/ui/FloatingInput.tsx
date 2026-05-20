import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, type = "text", className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";
    const currentType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full flex flex-col gap-2 text-left">
        <label className="text-[11px] font-bold text-muted/90 uppercase tracking-wider pl-1 select-none">
          {label}
        </label>
        <div className="relative w-full">
          <input
            type={currentType}
            ref={ref}
            className={`block w-full px-4 py-3.5 text-sm text-foreground bg-surface/80 dark:bg-black/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
              isPasswordType ? "pr-12" : ""
            } ${
              error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
            } ${className}`}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-destructive font-semibold pl-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";
