import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateBusinessButton from "@/components/admin/create-business-button";

export default async function AdminBusinessPage() {
  const business = await prisma.business.findFirst();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Business</h1>
          <p className="text-sm text-slate-600">Manage company information for Rafiul Anam LLC</p>
        </div>
      </div>

      {!business ? (
        <Card>
          <CardHeader>
            <CardTitle>No business record yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No business found. Create a default record for Rafiul Anam LLC.</p>
            <div className="mt-4">
              <CreateBusinessButton />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{business.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Legal name</p>
                <p className="font-medium">{business.legalName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{business.type ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Country / State</p>
                <p className="font-medium">{(business.country ?? "—") + (business.state ? `, ${business.state}` : "")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registration / Tax ID</p>
                <p className="font-medium">{business.registrationNumber ?? business.taxId ?? "—"}</p>
              </div>
            </div>
            {business.notes && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{business.notes}</p>
              </div>
            )}
            <div className="mt-4">
              <Button asChild>
                <a href="/admin/business/edit">Edit</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
