import * as React from "react";
import { cva } from "class-variance-authority";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

import { cn } from "@/lib/utils";

// Define the alertVariants with additional types (success, error, info, warning)
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        success: "bg-green-500 text-white [&>svg]:text-green-700",
        error: "bg-red-500 text-white [&>svg]:text-red-700",
        info: "bg-blue-500 text-white [&>svg]:text-blue-700",
        warning: "bg-yellow-500 text-black [&>svg]:text-yellow-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Alert component with variant selection and icon
function Alert({
  className,
  variant = "default",
  children,
  ...props
}) {
  // Define the icon based on the variant
  const getIcon = (variant) => {
    switch (variant) {
      case "success":
        return <FaCheckCircle className="text-current" />;
      case "error":
        return <FaTimesCircle className="text-current" />;
      case "info":
        return <FaInfoCircle className="text-current" />;
      case "warning":
        return <FaExclamationCircle className="text-current" />;
      default:
        return null;
    }
  };

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        className,
        "animate-fadeIn" // Add fade-in animation
      )}
      {...props}
    >
      {getIcon(variant)} {/* Display the icon */}
      {children}
    </div>
  );
}

// Title for alert
function AlertTitle({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Description for alert
function AlertDescription({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import { css } from '@emotion/react';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInStyle = css`
  animation: ${fadeIn} 0.5s ease-out;
`;

export { Alert, AlertTitle, AlertDescription, fadeInStyle };
