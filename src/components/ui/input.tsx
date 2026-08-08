import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          ref={ref}
          id={inputId}
          data-slot="input"
          aria-invalid={!!error}
          className={cn(
            "flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "selection:bg-primary selection:text-primary-foreground",
            "placeholder:text-muted-foreground",
            "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
