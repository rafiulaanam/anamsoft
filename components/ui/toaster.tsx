"use client";

import { useToast } from "./use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "w-80 rounded-xl border bg-white shadow-lg p-4 text-sm text-slate-800",
            toast.variant === "destructive" && "border-rose-200 bg-rose-50 text-rose-800",
            toast.variant !== "destructive" && "border-slate-200"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              {toast.description && <p className="text-slate-600 text-sm">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
