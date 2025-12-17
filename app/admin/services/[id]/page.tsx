import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ServiceForm } from "../_components/service-form";
import { updateService } from "../actions";
import { serviceToFormValues } from "../transformers";
import { PackagesEditor } from "../_components/packages-editor";

export const metadata: Metadata = {
  title: "Edit Service | Admin",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminServiceEditPage({ params }: { params: { id: string } }) {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) {
    notFound();
  }

  const hasPackagesModel = (prisma as any)?.servicePackage?.findMany;
  const packages =
    hasPackagesModel &&
    (await prisma.servicePackage.findMany({
      where: { serviceId: service.id },
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }));

  const mappedPackages = (packages ?? []).map((pkg) => ({
    ...pkg,
    price: pkg.price.toString(),
    items: pkg.items.map((item) => ({ ...item })),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Services</p>
        <h1 className="text-2xl font-semibold">{service.title}</h1>
        <p className="text-sm text-muted-foreground">
          Manage details, status, packages, and SEO for this service.
        </p>
      </div>

      <ServiceForm
        mode="edit"
        showTabs
        action={updateService.bind(null, service.id)}
        initialValues={serviceToFormValues(service)}
      />
      <PackagesEditor serviceId={service.id} initialPackages={mappedPackages} />
    </div>
  );
}
