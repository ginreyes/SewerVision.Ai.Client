import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow,border] duration-150 ease-in-out placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
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
  )
})

export { Textarea }
