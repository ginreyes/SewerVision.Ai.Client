import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        rose: "bg-[#d76b84] text-white shadow-xs hover:bg-[#d76b84]/90",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-xs focus-visible:ring-green-300 dark:bg-green-700 dark:hover:bg-green-600",
        
        // SewerVision.ai Custom Variants
        ai: "bg-purple-600 text-white hover:bg-purple-700 shadow-xs focus-visible:ring-purple-300 dark:bg-purple-700 dark:hover:bg-purple-600",
        recording: "bg-red-600 text-white hover:bg-red-700 shadow-xs focus-visible:ring-red-300 dark:bg-red-700 dark:hover:bg-red-600 animate-pulse",
        processing: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-xs focus-visible:ring-yellow-300 dark:bg-yellow-700 dark:hover:bg-yellow-600",
        online: "bg-green-500 text-white hover:bg-green-600 shadow-xs focus-visible:ring-green-300",
        offline: "bg-gray-500 text-white hover:bg-gray-600 shadow-xs focus-visible:ring-gray-300",
        warning: "bg-orange-500 text-white hover:bg-orange-600 shadow-xs focus-visible:ring-orange-300",
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-xs focus-visible:ring-blue-300",
        
        // Gradient variants for special actions
        gradient: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xs",
        gradientSuccess: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-xs",
        gradientWarning: "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-xs",
        
        // Outline variants with custom colors
        outlineAi: "border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-950",
        outlineSuccess: "border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950",
        outlineWarning: "border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        iconSm: "size-8",
        iconLg: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  text,
  icon,
  iconComponent: Icon,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  // If children exist, use children; otherwise, use text prop.
  const content = children ?? (
    <>
      {/* Render image if icon prop is provided */}
      {icon && <img src={icon} alt="" className="mr-2" />}
      
      {/* Render React icon if iconComponent is provided */}
      {Icon && <Icon className="mr-2" />}
      
      {/* Render text prop */}
      {text}
    </>
  );

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {content}
    </Comp>
  );
}

export { Button, buttonVariants };