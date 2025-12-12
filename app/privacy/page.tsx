import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Privacy Policy | AnamSoft",
  description:
    "Privacy Policy for AnamSoft covering how we collect, use, and protect personal data for salon and small business clients.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-blush-50">
        <div className="section-shell max-w-4xl py-16 md:py-20 space-y-10">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-blush-700">Privacy Policy</p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">Privacy Policy</h1>
            <p className="text-sm text-slate-600">Last updated: (add date)</p>
          </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">1. Introduction</h2>
          <p className="text-slate-700 leading-relaxed">
            AnamSoft builds modern, mobile-friendly websites and software for small businesses, especially beauty salons,
            nail & hair studios, and spas. This Privacy Policy explains how we collect, use, and protect personal data.
            We comply with the EU General Data Protection Regulation (GDPR) and applicable Lithuanian data protection laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">2. Data controller</h2>
          <p className="text-slate-700 leading-relaxed">
            AnamSoft, based in Vilnius, Lithuania, is the data controller. For privacy inquiries, contact:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li>Email: hello@anamsoft.com</li>
            <li>Phone / WhatsApp: +37061104553</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">3. What personal data we collect</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>
              Contact / lead form data: name, salon or business name, email address, phone number (if provided), current
              website URL (if provided), and your message.
            </li>
            <li>Communication data: emails, messages, notes from discovery calls.</li>
            <li>
              Website usage & analytics data: IP address, device/browser type, pages visited, time on page, referrer,
              collected via privacy-friendly analytics or similar tools.
            </li>
            <li>Technical data related to cookies or similar technologies (if used).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">4. How and why we use personal data</h2>
          <p className="text-slate-700 leading-relaxed">We use data to:</p>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Respond to enquiries and contact requests.</li>
            <li>Schedule discovery calls and prepare proposals.</li>
            <li>Perform and deliver web and software services.</li>
            <li>Send service-related communications (project updates, invoices, support).</li>
            <li>Improve the website, services, and user experience (analytics).</li>
            <li>Maintain security and prevent abuse.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            Legal bases: performance of a contract or steps at your request; legitimate interests (e.g., improving
            services); consent (for optional communications/cookies where applicable); legal obligations (e.g., accounting
            and tax records).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">5. Cookies and analytics</h2>
          <p className="text-slate-700 leading-relaxed">
            We may use cookies or similar technologies and privacy-friendly analytics to understand site usage (pages
            visited, device/browser data, referrer). You can manage cookies in your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">6. How long we keep data</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Contact enquiries and project communication: kept as long as needed to respond and maintain the relationship.</li>
            <li>Accounting and invoicing data: kept as required by Lithuanian law.</li>
            <li>Analytics data: retained only as necessary for statistics and security.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">We do not keep data longer than necessary for the purposes described.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">7. How we share personal data</h2>
          <p className="text-slate-700 leading-relaxed">We do not sell personal data. We may share data with trusted service providers when necessary, such as:</p>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Hosting and email providers.</li>
            <li>Project management or communication tools.</li>
            <li>Payment / invoicing platforms.</li>
            <li>Analytics providers.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            These third parties act as processors and are required to protect data and use it only for specified purposes. If
            data is transferred outside the EU/EEA, appropriate safeguards (e.g., Standard Contractual Clauses) are used.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">8. Data security</h2>
          <p className="text-slate-700 leading-relaxed">
            We use reasonable technical and organisational measures (secure hosting, access controls, strong authentication,
            limited access) to protect personal data. No system is perfectly secure, but we take appropriate steps to safeguard
            information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">9. Your rights under GDPR</h2>
          <p className="text-slate-700 leading-relaxed">You have the right to:</p>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Access your personal data.</li>
            <li>Rectify inaccurate data.</li>
            <li>Erase data (right to be forgotten).</li>
            <li>Restrict processing.</li>
            <li>Data portability.</li>
            <li>Object to certain processing (e.g., direct marketing or legitimate interests).</li>
            <li>Withdraw consent at any time (where processing is based on consent).</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            To exercise your rights, contact hello@anamsoft.com. You may lodge a complaint with the Lithuanian State Data
            Protection Inspectorate or another EU supervisory authority.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">10. International data transfers</h2>
          <p className="text-slate-700 leading-relaxed">
            If services or hosting providers process data outside the EU/EEA, we use appropriate safeguards (such as Standard
            Contractual Clauses) to protect your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">11. Links to other websites</h2>
          <p className="text-slate-700 leading-relaxed">
            Our site may contain links to third-party websites (e.g., social media, booking tools). We are not responsible
            for their privacy practices. Please review their policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">12. Updates to this Privacy Policy</h2>
          <p className="text-slate-700 leading-relaxed">
            We may update this policy occasionally. Changes will be indicated by updating the date above. Please review
            periodically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">13. Contact information</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li>Email: hello@anamsoft.com</li>
            <li>Phone / WhatsApp: +37061104553</li>
          </ul>
          <p className="text-slate-600 text-sm">This document is informational and does not constitute legal advice.</p>
        </section>
      </div>
      </main>
    </>
  );
}
