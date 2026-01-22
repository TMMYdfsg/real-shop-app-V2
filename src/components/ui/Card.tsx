import React from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  clickable?: boolean;
  selected?: boolean;
  padding?: string | number;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, clickable, selected, className, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const hasStructuredChildren = childArray.some((child) => {
      if (!React.isValidElement(child)) return false;
      const displayName = (child.type as { displayName?: string }).displayName;
      return displayName && ["CardHeader", "CardContent", "CardFooter"].includes(displayName);
    });

    return (
      <div
        ref={ref}
        className={cn("ui-card", className)}
        data-clickable={clickable ? "true" : "false"}
        data-selected={selected ? "true" : "false"}
        {...props}
      >
        {title ? (
          <>
            <div className="ui-card__header">
              <div className="ui-card__title">{title}</div>
            </div>
            <div className="ui-card__content">{children}</div>
          </>
        ) : hasStructuredChildren ? (
          children
        ) : (
          <div className="ui-card__content">{children}</div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ui-card__header", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("ui-card__title", className)} {...props} />
  )
);

CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("ui-card__description", className)} {...props} />
));

CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ui-card__content", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ui-card__footer", className)} {...props} />
  )
);

CardFooter.displayName = "CardFooter";
