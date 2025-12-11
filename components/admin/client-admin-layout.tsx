"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/settings", label: "Settings" },
];

export function ClientAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-2 text-sm font-medium">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 transition-colors ${
              active ? "bg-blush-100 text-blush-700" : "text-slate-700 hover:bg-slate-100"
            }`}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-blush-50">
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col gap-6 border-r border-slate-200 bg-white/80 px-4 py-6">
          <div>
            <p className="text-xs uppercase text-slate-500">Anam Soft</p>
            <p className="text-lg font-semibold text-slate-900">Admin</p>
          </div>
          <NavLinks />
        </aside>
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="h-full flex flex-col" id="admin-mobile-nav">
            <SheetHeader>
              <SheetTitle>Anam Soft Admin</SheetTitle>
            </SheetHeader>
            <SheetContent>
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </div>
        </Sheet>
        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
              <div>
                <p className="text-xs uppercase text-slate-500">Anam Soft</p>
                <p className="text-lg font-semibold text-slate-900">Admin</p>
              </div>
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                  aria-label="Open navigation"
                  aria-expanded={open}
                  aria-controls="admin-mobile-nav"
                >
                  <Menu className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </header>
          <div className="px-4 sm:px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
