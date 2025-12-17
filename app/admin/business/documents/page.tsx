import { prisma } from "@/lib/db";
import BusinessDocumentsTable from "@/components/admin/business-documents-table";

export default async function DocumentsPage() {
  const business = await prisma.business.findFirst();
  const documents = business
    ? await prisma.businessDocument.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Business Documents</h1>
          <p className="text-sm text-muted-foreground">Manage legal, tax, and other documents for the business.</p>
        </div>
      </div>

      <div className="mt-6">
        {/* Pass documents into a client-side table component */}
        {/* @ts-ignore server -> client prop */}
        <BusinessDocumentsTable initialDocuments={documents} />
      </div>
    </div>
  );
}
