"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Layers,
  Image,
  Mail,
  Settings,
  FileSpreadsheet,
  Search,
  KanbanSquare,
  Menu,
  ChevronLeft,
  ChevronRight,
  Globe,
  LogOut,
} from "lucide-react";
import type { Route } from "next";

interface AdminShellProps {
  children: React.ReactNode;
  currentPath: string;
}

const adminNavItems: { label: string; href: Route; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Overview", href: "/admin" as Route, icon: LayoutDashboard },
  { label: "Services", href: "/admin/services" as Route, icon: Layers },
  { label: "Portfolio", href: "/admin/portfolio" as Route, icon: Image },
  { label: "Leads", href: "/admin/leads" as Route, icon: Mail },
  { label: "Projects", href: "/admin/projects" as Route, icon: FileSpreadsheet },
  { label: "Estimates", href: "/admin/estimates" as Route, icon: FileSpreadsheet },
  { label: "Website audits", href: "/admin/audits" as Route, icon: Search },
  { label: "Kanban", href: "/admin/kanban" as Route, icon: KanbanSquare },
  { label: "Settings", href: "/admin/settings" as Route, icon: Settings },
];

export function AdminShell({ children, currentPath }: AdminShellProps) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>("admin-sidebar-collapsed", false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  const SidebarContent = ({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-4 py-4", collapsed ? "justify-center" : "justify-start")}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          AS
        </div>
        {!collapsed && (
          <div className="text-left">
            <p className="text-xs uppercase text-muted-foreground">AnamSoft</p>
            <p className="text-sm font-semibold">Admin</p>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 px-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
                  collapsed && "justify-center px-2"
                )}
                onClick={onNavigate}
                aria-label={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className={cn("flex items-center justify-between px-3 py-3", collapsed && "justify-center")}>
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>{session?.user?.email ?? "Admin"}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky left-0 top-0 hidden h-screen border-r bg-background/95 backdrop-blur transition-[width] duration-300 md:block",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button
          variant="outline"
          size="sm"
          className="mx-2 mt-2 md:hidden"
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <SheetContent className="p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <p className="text-xs uppercase text-muted-foreground">AnamSoft</p>
                <p className="text-lg font-semibold text-foreground">Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>View site</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-3 pb-8 pt-4 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
