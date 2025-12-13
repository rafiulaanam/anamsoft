import { redirect } from "next/navigation";
import { auth } from "@/auth";


export default async function PortalIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return redirect("/portal/projects");
}
