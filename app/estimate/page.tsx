import { EstimateWizard } from "@/components/estimate/estimate-wizard";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function EstimatePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">
        <section className="space-y-4">
          <Badge variant="outline" className="rounded-full px-3">
            Estimate
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Get a website estimate in 2 minutes
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Answer a few quick questions about your business and the pages you need. We&apos;ll instantly give you a
            rough range and follow up with a tailored quote from AnamSoft.
          </p>
        </section>

        <EstimateWizard />
      </div>
    </main>
  );
}
