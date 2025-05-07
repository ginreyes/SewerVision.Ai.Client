import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  size = "md", 
  ...props
}) {
  // Define size variants
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
        "focus:border-[#D76A84] focus:ring-[#D76A84]/50 focus:ring-[3px]",
        "hover:border-[#D76A84]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
