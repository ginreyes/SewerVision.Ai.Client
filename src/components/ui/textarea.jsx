import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow,border] duration-150 ease-in-out placeholder:text-muted-foreground focus-visible:border-[#d76b84] focus-visible:ring-[3px] focus-visible:ring-[#d76b84]/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
