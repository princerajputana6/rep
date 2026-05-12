import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "./utils";

const CardContext = React.createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isCollapsible: boolean;
}>({
  collapsed: false,
  setCollapsed: () => {},
  isCollapsible: false,
});

function Card({ 
  className, 
  isCollapsible = false,
  defaultCollapsed = false,
  ...props 
}: React.ComponentProps<"div"> & { 
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <CardContext.Provider value={{ collapsed, setCollapsed, isCollapsible }}>
      <div
        data-slot="card"
        className={cn(
          "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border relative transition-all duration-200",
          className,
          collapsed && "gap-0"
        )}
        {...props}
      />
    </CardContext.Provider>
  );
}

function CardHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const { collapsed, setCollapsed, isCollapsible } = React.useContext(CardContext);

  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
        isCollapsible && "pr-12" // Make space for the toggle button
      )}
      {...props}
    >
      {children}
      {isCollapsible && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-4 top-6 p-1 hover:bg-muted rounded-md transition-colors"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { collapsed } = React.useContext(CardContext);
  if (collapsed) return null;

  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { collapsed } = React.useContext(CardContext);
  if (collapsed) return null;

  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
