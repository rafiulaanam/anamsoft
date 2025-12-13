import AuditForm from "@/components/audit/audit-form";
import { Badge } from "@/components/ui/badge";


export default function WebsiteAuditPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">
        <section className="space-y-4">
          <Badge variant="outline" className="rounded-full px-3">
            Free audit
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Get a free 5-minute audit of your salon website</h1>
          <p className="text-muted-foreground max-w-3xl">
            I’ll check your site for mobile experience, clarity, and booking flow, then email you 3–5 practical
            suggestions. Specialised in salons, beauty studios, spas and local services in Vilnius.
          </p>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Mobile experience and booking path</li>
            <li>• How easy it is to understand services and prices</li>
            <li>• Basic speed and SEO quick wins</li>
          </ul>
        </section>

        <AuditForm />
      </div>
    </main>
  );
}
