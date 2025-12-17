import { Resend, type EmailApiOptions } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM = process.env.EMAIL_FROM ?? "AnamSoft <hello@anamsoft.com>";
const DEFAULT_REPLY_TO = process.env.REPLY_FROM_EMAIL ?? "hello@anamsoft.com";
const BASE_SEND_OPTIONS: Pick<EmailApiOptions, "from" | "reply_to"> = {
  from: DEFAULT_FROM,
  reply_to: DEFAULT_REPLY_TO,
};

export interface ProjectEstimateEmailPayload {
  id: string;
  name: string;
  email: string;
  salonName?: string | null;
  websiteUrl?: string | null;
  businessType: string;
  pagesNeeded: string;
  bookingSetup: string;
  budgetRange: string;
  timeline: string;
  goals?: string | null;
}

export interface WebsiteAuditEmailPayload {
  id: string;
  name: string;
  email: string;
  websiteUrl: string;
  businessType?: string | null;
  mainGoal: string;
  message?: string | null;
}

export interface WebsiteAuditPayload {
  name: string;
  email: string;
  businessName?: string;
  websiteUrl: string;
  businessType?: string;
  mainProblems: string[];
  notes?: string;
}

interface BasicSiteConfig {
  siteName?: string | null;
  email?: string | null;
}

function getAdminEmail(config?: BasicSiteConfig): string {
  return (
    config?.email ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_TO ||
    "hello@anamsoft.com"
  );
}

export interface ContactLeadPayload {
  name: string;
  email: string;
  businessName?: string;
  websiteUrl?: string;
  budgetRange?: string;
  reason?: string;
  howHeard?: string;
  message?: string;
}

export interface ProjectEstimatePayload {
  name: string;
  email: string;
  businessName?: string;
  currentSite?: string;
  businessType?: string;
  pages: string[];
  features: string[];
  budgetRange?: string;
  urgency?: string;
  notes?: string;
  complexityScore: number;
  estimatedMin?: number;
  estimatedMax?: number;
}

export type LeadEmailPayload = {
  name: string;
  salonName: string;
  email: string;
  website?: string | null;
  message: string;
  createdAt: Date;
};

export async function sendLeadNotificationEmail(lead: LeadEmailPayload) {
  try {
    const { error } = await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: [process.env.EMAIL_TO ?? "hello@anamsoft.com"],
      subject: `New salon lead – ${lead.salonName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h2 style="margin-bottom: 8px;">New lead from ${lead.salonName}</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Salon name:</strong> ${lead.salonName}</p>
          <p><strong>Website:</strong> ${lead.website ?? "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p>${lead.message}</p>
          <p style="font-size: 12px; color: #64748b;">Created at: ${lead.createdAt.toISOString()}</p>
        </div>
      `,
    });
    if (error) {
      console.error("Resend notification error", error);
    }
  } catch (err) {
    console.error("Resend notification error", err);
  }
}

export async function sendLeadConfirmationEmail(lead: { name: string; salonName: string; email: string }) {
  try {
    const html = `
      <div style="background-color:#f3f4f6;padding:24px 0;">
        <div
          style="
            max-width:600px;
            margin:0 auto;
            background-color:#ffffff;
            border-radius:12px;
            border:1px solid #e5e7eb;
            padding:24px 24px 20px 24px;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            color:#0f172a;
            line-height:1.6;
          "
        >
          <!-- Header / brand -->
          <div style="margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;color:#0f172a;">AnamSoft</div>
            <div style="font-size:12px;color:#6b7280;">Web &amp; software studio in Vilnius</div>
          </div>

          <!-- Greeting -->
          <h2 style="margin:0 0 12px 0;font-size:18px;font-weight:600;">
            Hi ${lead.name || "there"},
          </h2>

          <!-- Main message -->
          <p style="margin:0 0 12px 0;">
            Thank you for reaching out about
            <strong>${lead.salonName}</strong>.
            I’ve received your message and will review your salon details shortly.
          </p>

          <p style="margin:0 0 12px 0;">
            I’ll follow up from
            <a href="mailto:hello@anamsoft.com" style="color:#2563eb;text-decoration:none;">
              hello@anamsoft.com
            </a>
            with next steps or a few quick questions if needed.
          </p>

          <p style="margin:0 0 12px 0;">
            If you prefer WhatsApp or a direct call, you can reach me at
            <strong>+37061104553</strong>.
          </p>

          <!-- Sign-off -->
          <p style="margin:16px 0 0 0;">
            Best regards,<br/>
            <strong>AnamSoft</strong>
          </p>
        </div>

        <!-- Footer note -->
        <p
          style="
            max-width:600px;
            margin:8px auto 0 auto;
            font-size:11px;
            color:#9ca3af;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            text-align:center;
          "
        >
          You’re receiving this email because you contacted AnamSoft about ${lead.salonName}.
          If this wasn’t you, you can safely ignore this message.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: [lead.email],
      subject: `Thanks for contacting AnamSoft about ${lead.salonName}`,
      html,
    });
    if (error) {
      console.error("Resend confirmation error", error);
    }
  } catch (err) {
    console.error("Resend confirmation error", err);
  }
}

export async function sendEstimateReplyEmail(opts: { to: string; subject: string; body: string }) {
  const { to, subject, body } = opts;

  const html = `
    <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#0f172a;line-height:1.6;">
      ${body
        .split("\n")
        .map((line) => `<p style="margin:0 0 8px 0;">${line}</p>`)
        .join("")}
      <p style="margin:16px 0 0 0;font-size:13px;color:#6b7280;">
        —
        <strong>AnamSoft</strong><br/>
        Websites for salons &amp; spas in Vilnius<br/>
        <a href="mailto:hello@anamsoft.com" style="color:#2563eb;text-decoration:none;">hello@anamsoft.com</a>
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("Error sending estimate reply email (resend error):", error);
      throw error;
    }
  } catch (error) {
    console.error("Error sending estimate reply email:", error);
    throw error;
  }
}

export async function sendProjectEstimateToAdmin(payload: ProjectEstimatePayload, config?: BasicSiteConfig) {
  const to = getAdminEmail(config);
  const siteName = config?.siteName ?? "AnamSoft";

  const {
    name,
    email,
    businessName,
    currentSite,
    businessType,
    pages,
    features,
    budgetRange,
    urgency,
    notes,
    complexityScore,
    estimatedMin,
    estimatedMax,
  } = payload;

  const priceRangeText =
    estimatedMin && estimatedMax ? `€${estimatedMin}–€${estimatedMax}` : "Not calculated";

  const html = `
      <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#0f172a;line-height:1.5;">
        <h2 style="margin:0 0 12px 0;">New website estimate request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${businessName ? `<p><strong>Business:</strong> ${businessName}</p>` : ""}
        ${currentSite ? `<p><strong>Current site:</strong> ${currentSite}</p>` : ""}

        ${businessType ? `<p><strong>Business type:</strong> ${businessType}</p>` : ""}

        <p><strong>Pages:</strong> ${pages.join(", ") || "Not specified"}</p>
        <p><strong>Features:</strong> ${features.join(", ") || "Not specified"}</p>

        ${budgetRange ? `<p><strong>Budget range:</strong> ${budgetRange}</p>` : ""}
        ${urgency ? `<p><strong>Urgency:</strong> ${urgency}</p>` : ""}

        ${notes ? `<p><strong>Notes:</strong><br/>${notes.replace(/\n/g, "<br/>")}</p>` : ""}

        <p><strong>Complexity score:</strong> ${complexityScore}</p>
        <p><strong>Estimated range:</strong> ${priceRangeText}</p>

        <p style="margin-top:16px;font-size:12px;color:#6b7280;">
          This estimate was submitted via the ${siteName} website estimate form.
        </p>
      </div>
    `;

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to,
      subject: `[${siteName}] New website estimate from ${name}`,
      html,
    });
  } catch (error) {
    console.error("Error sending project estimate to admin:", error);
  }
}

export async function sendProjectEstimateConfirmationEmail(
  payload: ProjectEstimatePayload,
  config?: BasicSiteConfig
) {
  const {
    name,
    email,
    businessName,
    businessType,
    pages,
    features,
    budgetRange,
    urgency,
    complexityScore,
    estimatedMin,
    estimatedMax,
  } = payload;

  const siteName = config?.siteName ?? "AnamSoft";
  const safeName = name || "there";
  const projectLabel = businessName || "your website project";

  const priceRangeText =
    estimatedMin && estimatedMax
      ? `Between approximately €${estimatedMin} and €${estimatedMax}`
      : "We’ll confirm a price range after reviewing your details.";

  const html = `
      <div style="background-color:#f3f4f6;padding:24px 0;">
        <div
          style="
            max-width:600px;
            margin:0 auto;
            background-color:#ffffff;
            border-radius:12px;
            border:1px solid #e5e7eb;
            padding:24px;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            color:#0f172a;
            line-height:1.6;
          "
        >
          <div style="margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;">${siteName}</div>
            <div style="font-size:12px;color:#6b7280;">Website &amp; digital studio in Vilnius</div>
          </div>

          <p style="margin:0 0 12px 0;">Hi ${safeName},</p>

          <p style="margin:0 0 12px 0;">
            Thanks for using the ${siteName} website estimate form for <strong>${projectLabel}</strong>.
            Based on your answers, a project like this typically falls in this range:
          </p>

          <p style="margin:0 0 12px 0;font-weight:600;">
            ${priceRangeText}
          </p>

          <p style="margin:0 0 12px 0;font-size:13px;color:#4b5563;">
            This is a rough estimate to help you understand the level of work involved.
            I’ll review your details and follow up by email from <strong>hello@anamsoft.com</strong> with a clearer quote or a few quick questions.
          </p>

          <p style="margin:0 0 12px 0;font-size:13px;color:#4b5563;">
            Summary of your answers:
          </p>

          <ul style="margin:0 0 12px 18px;padding:0;font-size:13px;color:#4b5563;">
            ${businessType ? `<li><strong>Business type:</strong> ${businessType}</li>` : ""}
            <li><strong>Pages:</strong> ${pages.join(", ") || "Not specified"}</li>
            <li><strong>Features:</strong> ${features.join(", ") || "Not specified"}</li>
            ${budgetRange ? `<li><strong>Budget range:</strong> ${budgetRange}</li>` : ""}
            ${urgency ? `<li><strong>Urgency:</strong> ${urgency}</li>` : ""}
            <li><strong>Complexity score (internal):</strong> ${complexityScore}</li>
          </ul>

          <p style="margin:0 0 12px 0;font-size:13px;">
            If you prefer WhatsApp or a call, you can reach me at <strong>+37061104553</strong>.
          </p>

          <p style="margin:16px 0 0 0;font-size:13px;">
            Best regards,<br/>
            <strong>${siteName}</strong><br/>
            <a href="mailto:hello@anamsoft.com" style="color:#2563eb;text-decoration:none;">hello@anamsoft.com</a><br/>
            <a href="https://anamsoft.com" style="color:#2563eb;text-decoration:none;">anamsoft.com</a>
          </p>
        </div>
      </div>
    `;

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: email,
      subject: `${siteName}: your website estimate`,
      html,
    });
  } catch (error) {
    console.error("Error sending project estimate confirmation:", error);
  }
}

export async function sendWebsiteAuditToAdmin(payload: WebsiteAuditPayload, config?: BasicSiteConfig) {
  const {
    name,
    email,
    businessName,
    websiteUrl,
    businessType,
    mainProblems,
    notes,
  } = payload;

  const to = getAdminEmail(config);
  const subject = `[AnamSoft] New website audit request from ${name}`;

  const html = `
      <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#0f172a;line-height:1.5;">
        <h2 style="margin:0 0 12px 0;">New free website audit request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${businessName ? `<p><strong>Business name:</strong> ${businessName}</p>` : ""}
        <p><strong>Website URL:</strong> <a href="${websiteUrl}" target="_blank" rel="noreferrer">${websiteUrl}</a></p>
        ${businessType ? `<p><strong>Business type:</strong> ${businessType}</p>` : ""}

        <p><strong>Main problems:</strong> ${mainProblems.length ? mainProblems.join(", ") : "Not specified"}</p>

        ${notes ? `<p><strong>Notes:</strong><br/>${notes.replace(/\n/g, "<br/>")}</p>` : ""}

        <p style="margin-top:16px;font-size:12px;color:#6b7280;">
          This request was submitted via the AnamSoft free website audit form.
        </p>
      </div>
    `;

  const { error } = await resend.emails.send({
    ...BASE_SEND_OPTIONS,
    to,
    subject,
    html,
  });
  if (error) {
    console.error("Error sending website audit to admin:", error);
  }
}

export async function sendWebsiteAuditConfirmationToClient(payload: WebsiteAuditPayload, config?: BasicSiteConfig) {
  const { name, businessName, websiteUrl, mainProblems } = payload;

  const safeName = name || "there";
  const projectLabel = businessName || "your salon";
  const problemsText = mainProblems.length ? mainProblems.join(", ") : "not specified";
  const siteName = config?.siteName ?? "AnamSoft";

  const html = `
      <div style="background-color:#f3f4f6;padding:24px 0;">
        <div
          style="
            max-width:600px;
            margin:0 auto;
            background-color:#ffffff;
            border-radius:12px;
            border:1px solid #e5e7eb;
            padding:24px;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            color:#0f172a;
            line-height:1.6;
          "
        >
          <div style="margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;">${siteName}</div>
            <div style="font-size:12px;color:#6b7280;">Websites for salons &amp; local businesses in Vilnius</div>
          </div>

          <p style="margin:0 0 12px 0;">Hi ${safeName},</p>

          <p style="margin:0 0 12px 0;">
            Thanks for requesting a free website audit for <strong>${projectLabel}</strong>.
            I’ll review your website:
          </p>

          <p style="margin:0 0 12px 0;">
            <a href="${websiteUrl}" style="color:#2563eb;text-decoration:none;" target="_blank" rel="noreferrer">
              ${websiteUrl}
            </a>
          </p>

          <p style="margin:0 0 12px 0;">
            Based on what you mentioned, you’re mainly concerned about:
            <br/>
            <strong>${problemsText}</strong>
          </p>

          <p style="margin:0 0 12px 0;font-size:13px;color:#4b5563;">
            I’ll send you 3–5 practical suggestions by email, usually within 1–2 working days.
            If I see that a redesign would help a lot, I’ll also suggest what a new site could look like.
          </p>

          <p style="margin:0 0 12px 0;font-size:13px;">
            If this is urgent, you can also reach me at:
            <br/>
            <strong>WhatsApp:</strong> +37061104553
            <br/>
            <strong>Email:</strong> <a href="mailto:hello@anamsoft.com" style="color:#2563eb;text-decoration:none;">hello@anamsoft.com</a>
          </p>

          <p style="margin:16px 0 0 0;font-size:13px;">
            Best regards,<br/>
            <strong>Rafiul</strong><br/>
            AnamSoft<br/>
            <a href="https://anamsoft.com" style="color:#2563eb;text-decoration:none;">anamsoft.com</a>
          </p>
        </div>
      </div>
    `;

  const { error } = await resend.emails.send({
    ...BASE_SEND_OPTIONS,
    to: payload.email,
    subject: "We’ve received your website audit request",
    html,
  });
  if (error) {
    console.error("Error sending website audit confirmation:", error);
  }
}

export async function sendEmailVerificationEmail(
  user: { email: string; name?: string | null },
  token: string
) {
  try {
    const verifyUrl = `${
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    }/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

    console.log("Email verification link:", verifyUrl);

    const safeName = user.name?.trim() || "there";
    const subject = "Verify your email – AnamSoft";
    const html = `
      <div style="background-color:#f3f4f6;padding:24px 0;">
        <div
          style="
            max-width:600px;
            margin:0 auto;
            background-color:#ffffff;
            border-radius:12px;
            border:1px solid #e5e7eb;
            padding:24px 24px 20px 24px;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            color:#0f172a;
            line-height:1.6;
          "
        >
          <!-- Header / brand -->
          <div style="margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;color:#0f172a;">AnamSoft</div>
            <div style="font-size:12px;color:#6b7280;">Web &amp; software studio in Vilnius</div>
          </div>

          <!-- Greeting -->
          <p style="margin:0 0 12px 0;font-size:14px;">
            Hi ${safeName},
          </p>

          <!-- Main text -->
          <p style="margin:0 0 12px 0;">
            Thanks for creating an account with <strong>AnamSoft</strong>.
            Please verify your email address to activate your account and access your dashboard.
          </p>

          <p style="margin:0 0 12px 0;">
            For your security, this link will only work for a limited time. If it expires, you can request a new one from the login page.
          </p>

          <!-- Button -->
          <div style="margin:20px 0;">
            <a
              href="${verifyUrl}"
              style="
                display:inline-block;
                padding:10px 18px;
                border-radius:9999px;
                background-color:#2563eb;
                color:#ffffff;
                text-decoration:none;
                font-weight:500;
                font-size:14px;
              "
              target="_blank"
              rel="noreferrer"
            >
              Verify my email
            </a>
          </div>

          <!-- Fallback link -->
          <p style="margin:0 0 12px 0;font-size:12px;color:#6b7280;">
            If the button doesn’t work, copy and paste this link into your browser:
          </p>
          <p style="margin:0 0 12px 0;font-size:11px;color:#4b5563;word-break:break-all;">
            ${verifyUrl}
          </p>

          <!-- Security note -->
          <p style="margin:16px 0 0 0;font-size:12px;color:#6b7280;">
            If you didn’t create an account with AnamSoft, you can safely ignore this email.
          </p>

          <!-- Sign-off -->
          <p style="margin:12px 0 0 0;font-size:13px;">
            Best regards,<br/>
            <strong>AnamSoft</strong><br/>
            <a href="mailto:hello@anamsoft.com" style="color:#2563eb;text-decoration:none;">hello@anamsoft.com</a><br/>
            <a href="https://anamsoft.com" style="color:#2563eb;text-decoration:none;">anamsoft.com</a>
          </p>
        </div>

        <!-- Footer note -->
        <p
          style="
            max-width:600px;
            margin:8px auto 0 auto;
            font-size:11px;
            color:#9ca3af;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            text-align:center;
          "
        >
          You’re receiving this email because someone used this address to sign up at anamsoft.com.
          If this wasn’t you, you don’t need to do anything.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: [user.email],
      subject,
      html,
    });
    if (error) console.error("Resend verification error", error);
  } catch (err) {
    console.error("Resend verification error", err);
  }
}

export async function sendPasswordResetEmail(
  user: { email: string; name?: string | null },
  token: string
) {
  try {
    const resetUrl = `${
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    }/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

    const { error } = await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: [user.email],
      subject: "Reset your password for AnamSoft",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h2 style="margin-bottom: 8px;">Hi ${user.name || "there"},</h2>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <p style="margin: 16px 0;">
            <a href="${resetUrl}" style="background: #8b5cf6; color: #fff; padding: 12px 18px; border-radius: 8px; text-decoration: none;">Reset password</a>
          </p>
          <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
    if (error) console.error("Resend password reset error", error);
  } catch (err) {
    console.error("Resend password reset error", err);
  }
}

export async function sendContactLeadEmailToAdmin(payload: ContactLeadPayload, config?: BasicSiteConfig) {
  const to = getAdminEmail(config);
  const siteName = config?.siteName ?? "AnamSoft";
  const { name, email, businessName, websiteUrl, budgetRange, message, howHeard, reason } = payload;
  const subject = `[${siteName}] New contact request from ${name}`;
  const html = `
    <h2>New contact request</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${businessName ? `<p><strong>Business:</strong> ${businessName}</p>` : ""}
    ${websiteUrl ? `<p><strong>Current website:</strong> ${websiteUrl}</p>` : ""}
    ${budgetRange ? `<p><strong>Budget range:</strong> ${budgetRange}</p>` : ""}
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
    ${howHeard ? `<p><strong>How they heard about us:</strong> ${howHeard}</p>` : ""}
    ${message ? `<p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>` : ""}
    <p style="margin-top:16px;font-size:12px;color:#666;">
      This contact was submitted via the AnamSoft website contact form.
    </p>
  `;

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending contact lead email:", error);
  }
}

export async function sendContactLeadConfirmationEmail(payload: ContactLeadPayload) {
  const { name, email, businessName } = payload;
  const safeName = name?.trim() || "there";
  const projectLabel = businessName?.trim() || "your website project";
  const subject = `Thanks for contacting AnamSoft about ${projectLabel}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827; line-height: 1.5; padding: 24px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 24px;">
        <div style="margin-bottom: 16px;">
          <div style="font-size: 18px; font-weight: 600; color: #111827;">AnamSoft</div>
          <div style="font-size: 12px; color: #6b7280;">Web & software studio in Vilnius</div>
        </div>

        <p style="margin: 0 0 12px 0;">Hi ${safeName},</p>

        <p style="margin: 0 0 12px 0;">
          Thank you for contacting <strong>AnamSoft</strong> about <strong>${projectLabel}</strong>.
          I’ve received your message and will review your details shortly.
        </p>

        <p style="margin: 0 0 12px 0;">Here’s what happens next:</p>
        <ol style="margin: 0 0 12px 20px; padding: 0; color: #374151;">
          <li style="margin-bottom: 4px;">I review your business and any information you shared.</li>
          <li style="margin-bottom: 4px;">If I need anything else, I’ll email you from <strong>hello@anamsoft.com</strong>.</li>
          <li style="margin-bottom: 4px;">If we’re a good fit, we can schedule a short call to discuss your website and next steps.</li>
        </ol>

        <p style="margin: 0 0 12px 0;">If you prefer WhatsApp or a direct call, you can reach me at:</p>
        <p style="margin: 0 0 12px 0;">
          <strong>WhatsApp / phone:</strong> +37061104553<br/>
          <strong>Email:</strong> <a href="mailto:hello@anamsoft.com" style="color: #2563eb; text-decoration: none;">hello@anamsoft.com</a>
        </p>

        <p style="margin: 16px 0 0 0;">
          Best regards,<br/>
          <strong>AnamSoft</strong><br/>
          <a href="https://anamsoft.com" style="color: #2563eb; text-decoration: none;">anamsoft.com</a>
        </p>
      </div>

      <p style="max-width: 600px; margin: 8px auto 0 auto; font-size: 11px; color: #9ca3af; text-align: center;">
        You’re receiving this email because you submitted a form on anamsoft.com.
        If this wasn’t you, you can ignore this message.
      </p>
    </div>
  `;
  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending contact confirmation email:", error);
  }
}

export async function sendProjectEstimateAdminNotification(
  estimate: ProjectEstimateEmailPayload,
  config?: BasicSiteConfig
) {
  const to = getAdminEmail(config);
  const siteName = config?.siteName ?? "AnamSoft";

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to,
      subject: `New project estimate from ${estimate.name}`,
      html: `
        <h2>New project estimate</h2>
        <p><strong>Name:</strong> ${estimate.name}</p>
        <p><strong>Email:</strong> ${estimate.email}</p>
        ${estimate.salonName ? `<p><strong>Salon:</strong> ${estimate.salonName}</p>` : ""}
        ${estimate.websiteUrl ? `<p><strong>Website:</strong> <a href="${estimate.websiteUrl}" target="_blank">${estimate.websiteUrl}</a></p>` : ""}

        <p><strong>Business type:</strong> ${estimate.businessType}</p>
        <p><strong>Pages needed:</strong> ${estimate.pagesNeeded}</p>
        <p><strong>Booking setup:</strong> ${estimate.bookingSetup}</p>
        <p><strong>Budget range:</strong> ${estimate.budgetRange}</p>
        <p><strong>Timeline:</strong> ${estimate.timeline}</p>
        ${estimate.goals ? `<p><strong>Goals:</strong> ${estimate.goals}</p>` : ""}

        <p style="margin-top:16px;font-size:12px;color:#666;">
          This estimate was submitted via the ${siteName} website.
        </p>
      `,
    });
  } catch (error) {
    console.error("Error sending project estimate admin email:", error);
  }
}

export async function sendProjectEstimateClientConfirmation(
  estimate: ProjectEstimateEmailPayload,
  config?: BasicSiteConfig
) {
  const siteName = config?.siteName ?? "AnamSoft";

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: estimate.email,
      subject: `Thanks for your project details – ${siteName}`,
      html: `
        <p>Hi ${estimate.name},</p>
        <p>Thanks for sharing details about your salon website project.</p>
        <p>I’ll review your answers (pages needed, budget range and timeline) and email you a tailored estimate soon.</p>

        <p><strong>Quick summary:</strong></p>
        <ul>
          <li>Business type: ${estimate.businessType}</li>
          <li>Budget range: ${estimate.budgetRange}</li>
          <li>Timeline: ${estimate.timeline}</li>
        </ul>

        <p>If you’d like to share anything else, just reply to this email.</p>
        <p>Best regards,<br />${siteName}</p>
      `,
    });
  } catch (error) {
    console.error("Error sending project estimate client email:", error);
  }
}

export async function sendWebsiteAuditAdminNotification(
  audit: WebsiteAuditEmailPayload,
  config?: BasicSiteConfig
) {
  const to = getAdminEmail(config);
  const siteName = config?.siteName ?? "AnamSoft";

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to,
      subject: `New website audit request from ${audit.name}`,
      html: `
        <h2>New website audit request</h2>
        <p><strong>Name:</strong> ${audit.name}</p>
        <p><strong>Email:</strong> ${audit.email}</p>
        <p><strong>Website:</strong> <a href="${audit.websiteUrl}" target="_blank">${audit.websiteUrl}</a></p>
        ${audit.businessType ? `<p><strong>Business type:</strong> ${audit.businessType}</p>` : ""}
        <p><strong>Main goal:</strong> ${audit.mainGoal}</p>
        ${audit.message ? `<p><strong>Message:</strong> ${audit.message}</p>` : ""}

        <p style="margin-top:16px;font-size:12px;color:#666;">
          This audit was requested via the ${siteName} website.
        </p>
      `,
    });
  } catch (error) {
    console.error("Error sending website audit admin email:", error);
  }
}

export async function sendWebsiteAuditClientConfirmation(
  audit: WebsiteAuditEmailPayload,
  config?: BasicSiteConfig
) {
  const siteName = config?.siteName ?? "AnamSoft";

  try {
    await resend.emails.send({
      ...BASE_SEND_OPTIONS,
      to: audit.email,
      subject: `Thanks for requesting a website audit – ${siteName}`,
      html: `
        <p>Hi ${audit.name},</p>
        <p>Thanks for requesting a free website audit for <strong>${audit.websiteUrl}</strong>.</p>
        <p>I’ll review your site with your main goal in mind (“${audit.mainGoal}”) and send you a short, clear summary with suggestions.</p>
        <p>Usually I reply within 24 hours.</p>

        <p>Best regards,<br />${siteName}</p>
      `,
    });
  } catch (error) {
    console.error("Error sending website audit client email:", error);
  }
}
