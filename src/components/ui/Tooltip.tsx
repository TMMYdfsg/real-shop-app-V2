import React from "react";
import { cn } from "@/lib/cn";

interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, className, children, ...props }) => (
  <span className={cn("ui-tooltip", className)} data-tooltip={content} {...props}>
    {children}
  </span>
);
