import React from "react";
import { cn } from "@/lib/cn";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: "success" | "warn" | "danger" | "neutral";
  density?: "default" | "compact";
}

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ status = "neutral", density = "default", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("ui-chip", className)}
      data-status={status === "neutral" ? undefined : status}
      data-density={density === "compact" ? "compact" : undefined}
      {...props}
    />
  )
);

Chip.displayName = "Chip";
