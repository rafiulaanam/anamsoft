import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ServiceForm } from "../_components/service-form";
import { createService } from "../actions";
import { serviceToFormValues } from "../transformers";
import type { ServiceFormValues } from "../types";

export const metadata: Metadata = {
  title: "New Service | Admin",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = {
  searchParams?: { duplicate?: string };
};

export default async function AdminServiceCreatePage({ searchParams }: Props) {
  let initialValues: ServiceFormValues | undefined;

  if (searchParams?.duplicate) {
    const duplicate = await prisma.service.findUnique({ where: { id: searchParams.duplicate } });
    if (duplicate) {
      const mapped = serviceToFormValues(duplicate);
      initialValues = { ...mapped, slug: "" };
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Services</p>
        <h1 className="text-2xl font-semibold">Create service</h1>
        <p className="text-sm text-muted-foreground">
          Add a new service with pricing, delivery expectations, and supporting content.
        </p>
      </div>

      <ServiceForm mode="create" action={createService} initialValues={initialValues} />
    </div>
  );
}
