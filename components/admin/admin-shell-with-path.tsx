"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./admin-shell";

type Props = {
  children: React.ReactNode;
  leadsCount?: number;
  unreadLeadsCount?: number;
};

export function AdminShellWithPath({ children, leadsCount, unreadLeadsCount }: Props) {
  const pathname = usePathname() ?? "/admin";
  return (
    <AdminShell currentPath={pathname} leadsCount={leadsCount} unreadLeadsCount={unreadLeadsCount}>
      {children}
    </AdminShell>
  );
}
