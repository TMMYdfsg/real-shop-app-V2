import React from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "outline" | "warning";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantMap: Record<string, "primary" | "secondary" | "danger" | "ghost"> = {
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
  ghost: "ghost",
  success: "primary",
  outline: "secondary",
  warning: "secondary",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const resolvedVariant = variantMap[variant] ?? "primary";
    return (
      <button
        ref={ref}
        className={cn("ui-button", className)}
        data-variant={resolvedVariant}
        data-size={size}
        data-full={fullWidth ? "true" : "false"}
        data-loading={isLoading ? "true" : "false"}
        aria-busy={isLoading || undefined}
        type={props.type ?? "button"}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="ui-inline">
            <span aria-hidden>⏳</span>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
