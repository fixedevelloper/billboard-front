"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            data-slot="input"
            aria-invalid={!!error}
            className={cn(
              "flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-sm shadow-xs transition-[color,box-shadow] outline-none",
              "selection:bg-primary selection:text-primary-foreground",
              "placeholder:text-muted-foreground",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            tabIndex={-1}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
