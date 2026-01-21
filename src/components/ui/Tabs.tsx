import React, { createContext, useContext } from "react";
import { cn } from "@/lib/cn";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => (
  <TabsContext.Provider value={{ value, onChange: onValueChange }}>
    <div className={cn("ui-tabs", className)}>{children}</div>
  </TabsContext.Provider>
);

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ui-tabs__list", className)} {...props} />
  )
);

TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) return null;
    const isActive = context.value === value;
    return (
      <button
        ref={ref}
        type="button"
        className={cn("ui-tabs__trigger", className)}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => context.onChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context || context.value !== value) return null;
    return (
      <div ref={ref} className={cn("ui-tabs__content", className)} {...props}>
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";
