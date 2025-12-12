"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = React.useState<string | undefined>(defaultOpenId);

  React.useEffect(() => {
    if (!openId && items.length > 0) {
      setOpenId(defaultOpenId ?? items[0]?.id);
    }
  }, [items, defaultOpenId, openId]);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div
            key={item.id}
            className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-slate-900"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? undefined : item.id)}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
