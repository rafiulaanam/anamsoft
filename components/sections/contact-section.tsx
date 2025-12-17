import { LeadCaptureForm } from "@/components/sections/lead-capture-form";

interface ContactSectionProps {
  email: string;
  whatsapp: string;
  serviceOptions?: { id: string; label: string }[];
}

export function ContactSection({ email, whatsapp, serviceOptions }: ContactSectionProps) {
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <section id="contact" className="border-t bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-blush-700">Contact</div>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                Let’s talk about your salon website
              </h2>
              <p className="text-slate-600">
                Free review, no obligation, honest feedback for beauty and wellness sites.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Free website review</li>
              <li>• No obligation</li>
              <li>• Honest feedback</li>
            </ul>
            <div className="space-y-2 text-sm text-slate-700">
              <div>
                <span className="font-semibold">Email:</span>{" "}
                <a className="hover:text-blush-700" href={`mailto:${email}`}>
                  {email}
                </a>
              </div>
              <div>
                <span className="font-semibold">WhatsApp:</span>{" "}
                <a className="hover:text-blush-700" href={whatsappHref} target="_blank" rel="noreferrer">
                  {whatsapp}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Send a quick message</h3>
              <p className="text-sm text-slate-600">
                Tell me about your salon and what you want from your website.
              </p>
            </div>
            <div className="mt-6">
              <LeadCaptureForm
                serviceOptions={serviceOptions}
                source="home_contact_section"
                submitLabel="Send project brief"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
