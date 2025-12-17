"use client";

// Lightweight Select implementation without external deps (Radix replacement)

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectCtx = {
  value?: string;
  setValue: (v: string) => void;
  registerLabel: (value: string, label: string) => void;
  labels: Record<string, string>;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const SelectContext = createContext<SelectCtx | null>(null);

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

const Select = ({ value: controlled, defaultValue, onValueChange, children }: SelectProps) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const labelsRef = useRef<Record<string, string>>({});

  const value = controlled ?? uncontrolled;
  const setValue = useCallback(
    (next: string) => {
      if (controlled === undefined) setUncontrolled(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [controlled, onValueChange]
  );

  const ctx: SelectCtx = useMemo(
    () => ({
      value,
      setValue,
      registerLabel: (v, lbl) => {
        labelsRef.current[v] = lbl;
      },
      labels: labelsRef.current,
      open,
      setOpen,
    }),
    [open, setOpen, setValue, value]
  );

  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
};

const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

const useSelect = () => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within <Select>");
  return ctx;
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { setOpen, open } = useSelect();
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, labels } = useSelect();
  if (!value) return <span className="text-muted-foreground">{placeholder}</span>;
  return <span>{labels[value] ?? value}</span>;
};

const SelectContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { open } = useSelect();
  if (!open) return null;
  return (
    <div
      className={cn(
        "relative z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

const SelectLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>
);

const SelectItem = ({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
  const { value: current, setValue, registerLabel } = useSelect();
  const labelText = typeof children === "string" ? children : React.isValidElement(children) ? (children as any).props?.children ?? "" : "";

  React.useEffect(() => {
    registerLabel(value, labelText || String(children));
  }, [registerLabel, value, labelText, children]);

  const selected = current === value;
  return (
    <div
      role="option"
      aria-selected={selected}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selected && "bg-accent/70",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected ? <Check className="h-4 w-4" /> : null}
      </span>
      {children}
    </div>
  );
};

const SelectSeparator = ({ className }: { className?: string }) => <div className={cn("my-1 h-px bg-muted", className)} />;

const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
