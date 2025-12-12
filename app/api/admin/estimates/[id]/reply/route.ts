import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEstimateReplyEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { subject, body } = await req.json();
    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }

    const estimate = await prisma.projectEstimate.findUnique({
      where: { id: params.id },
    });

    if (!estimate || !estimate.email) {
      return NextResponse.json({ error: "Estimate not found." }, { status: 404 });
    }

    await sendEstimateReplyEmail({
      to: estimate.email,
      subject,
      body,
    });

    // Try to persist reply if the model exists (guards against older Prisma clients)
    try {
      // @ts-ignore - optional model
      if ((prisma as any).estimateReply?.create) {
        await (prisma as any).estimateReply.create({
          data: {
            projectEstimateId: estimate.id,
            subject,
            body,
            fromEmail: process.env.EMAIL_FROM ?? "info@rafiulanamllc.com",
            toEmail: estimate.email,
          },
        });
      }
    } catch (err) {
      console.error("Persisting reply failed (model may be missing), email was still sent.", err);
    }

    // Optionally update status if field exists
    try {
      await prisma.projectEstimate.update({
        where: { id: estimate.id },
        data: { status: "CONTACTED" },
      });
    } catch (err) {
      console.error("Status update failed (field may be missing).", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Estimate reply error", error);
    return NextResponse.json({ error: "Unable to send reply." }, { status: 500 });
  }
}
