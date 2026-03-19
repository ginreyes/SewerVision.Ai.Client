import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  size = "md",
  ...props
}) {
  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-9 text-base",
    xl: "h-12 text-lg",
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        sizeClasses[size],
        className
      )}
      style={{
        "--focus-color": "var(--role-accent, #d76a84)",
        "--focus-ring": "var(--role-accent-ring, rgba(215,106,132,0.3))",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--role-accent, #d76a84)";
        e.target.style.boxShadow = "0 0 0 3px var(--role-accent-ring, rgba(215,106,132,0.3))";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "";
        e.target.style.boxShadow = "";
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
}

export { Input };
