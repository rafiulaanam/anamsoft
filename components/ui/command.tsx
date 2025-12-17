"use client";

import * as React from "react";
import { Dialog, DialogContent } from "./dialog";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />
));
Command.displayName = "Command";

const CommandDialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="overflow-hidden p-0">
      {children}
    </DialogContent>
  </Dialog>
);

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" aria-label="command">
    <input
      ref={ref}
      className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground", className)}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-6 text-center text-sm text-muted-foreground", className)} {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-3 py-2 text-xs font-medium uppercase text-muted-foreground", className)} {...props} />
));
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
      , className)}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };
