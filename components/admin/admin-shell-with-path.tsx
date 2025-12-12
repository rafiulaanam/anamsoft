"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./admin-shell";

export function AdminShellWithPath({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  return <AdminShell currentPath={pathname}>{children}</AdminShell>;
}
