import { prisma } from "@/lib/db";
import AmazonProductsTable from "@/components/admin/amazon-products-table";

export default async function ProductsPage() {
  const business = await prisma.business.findFirst();
  const products = business
    ? await prisma.amazonProduct.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Amazon products</h1>
          <p className="text-sm text-muted-foreground">Manage FBA / FBM product tracking for the business.</p>
        </div>
      </div>

      <div className="mt-6">
        {/* @ts-ignore */}
        <AmazonProductsTable initialProducts={products} />
      </div>
    </div>
  );
}
