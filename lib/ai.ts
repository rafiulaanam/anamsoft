// Lazy-load OpenAI to avoid build-time failures when the package or API key is missing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let openai: any = null;
function getOpenAI() {
  if (openai) return openai;
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const OpenAI = require("openai").default || require("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai;
  } catch (err) {
    console.error("OpenAI client not available:", err);
    return null;
  }
}

export interface AIProjectEstimateInput {
  name: string;
  email: string;
  businessName?: string | null;
  businessType?: string | null;
  currentSite?: string | null;
  pages?: string[];
  features?: string[];
  budgetRange?: string | null;
  urgency?: string | null;
  notes?: string | null;
}

export interface ProjectDescriptionAIInput {
  businessName?: string;
  businessType?: string;
  location?: string;
  mainGoal?: string;
  extraInfo?: string;
  tone?: "simple" | "professional" | "friendly";
}

export async function generateEstimateReplyWithAI(
  estimate: AIProjectEstimateInput
): Promise<{ subject: string; body: string }> {
  const client = getOpenAI();
  if (!client) {
    return { subject: "Website estimate for your project", body: "" };
  }
  const {
    name,
    businessName,
    businessType,
    currentSite,
    pages = [],
    features = [],
    budgetRange,
    urgency,
    notes,
  } = estimate;

  const safeName = name || "there";
  const safeBusiness = businessName || "your business";
  const pagesText = pages.length ? pages.join(", ") : "not specified";
  const featuresText = features.length ? features.join(", ") : "not specified";

  const userContext = `
Lead details:
- Client name: ${safeName}
- Business name: ${safeBusiness}
- Business type: ${businessType || "not specified"}
- Current website: ${currentSite || "none / not provided"}
- Pages requested: ${pagesText}
- Features requested: ${featuresText}
- Budget range: ${budgetRange || "not specified"}
- Timeline / urgency: ${urgency || "not specified"}
- Notes from client: ${notes || "none provided"}

You are AnamSoft, a small web studio in Vilnius, building modern websites for salons, beauty studios and local service businesses.
Write a friendly, professional email reply that:

1. Thanks them for the information.
2. Shows you understood their business and main goal.
3. Gives a rough direction on scope (how many pages and main features).
4. Mentions the budget range and whether it seems realistic.
5. Suggests a simple next step (short call or email confirmation).

Do NOT invent exact prices unless the budget range is already clear.
If the budget is very low for the complexity, gently propose a smaller scoped option.

Write the email in clear English.
Keep it around 2–5 short paragraphs, no fluff.
End with your name (Rafiul Anam) and THESE exact contact details (do not invent numbers):
- Email: hello@anamsoft.com
- WhatsApp / phone: +370 611 04553 (link: https://wa.me/37061104553)
- Website: https://anamsoft.com
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that writes professional, friendly client emails for a small web agency called AnamSoft in Vilnius. You always sound clear, respectful and practical.",
      },
      {
        role: "user",
        content: userContext,
      },
    ],
    temperature: 0.4,
  });

  const fullText = completion?.choices?.[0]?.message?.content ?? "";

  let subject = "Website estimate for your project";
  let body = fullText;

  const subjectMatch = fullText.match(/Subject:\s*(.+)/i);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    body = fullText.replace(subjectMatch[0], "").trim();
  }

  return { subject, body };
}

export async function generateProjectDescriptionWithAI(
  input: ProjectDescriptionAIInput
): Promise<string> {
  const client = getOpenAI();
  if (!client) {
    return "";
  }

  const {
    businessName,
    businessType,
    location,
    mainGoal,
    extraInfo,
    tone = "friendly",
  } = input;

  const nameText = businessName || "my business";
  const typeText = businessType || "local business";
  const locationText = location || "my city";

  const prompt = `
You are helping a small business owner write a short description of their website project.

Business:
- Name: ${nameText}
- Type: ${typeText}
- Location: ${locationText}
- Main goal for the website: ${mainGoal || "not specified"}
- Extra info: ${extraInfo || "none"}

Tone: ${tone}

Write 1–2 short paragraphs in clear English that:
- Say what the business does and where it is.
- Mention the main goal for the website (e.g. more bookings, better online profile).
- (Optional) Mention key features if relevant (e.g. services, gallery, contact form).
- Sound natural and human, not like AI.
- Avoid buzzwords and complex marketing language.

Do NOT add greetings or sign-offs. Just the description text.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You write short, simple website project descriptions for small salons and local service businesses.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
  });

  const text = completion?.choices?.[0]?.message?.content ?? "";
  return text.trim();
}
