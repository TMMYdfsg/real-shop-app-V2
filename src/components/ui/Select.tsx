import React from "react";
import { cn } from "@/lib/cn";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn("ui-input", className)} {...props} />
  )
);

Select.displayName = "Select";
