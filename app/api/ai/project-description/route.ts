import { NextRequest, NextResponse } from "next/server";
import { generateProjectDescriptionWithAI, ProjectDescriptionAIInput } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ProjectDescriptionAIInput>;

    const input: ProjectDescriptionAIInput = {
      businessName: body.businessName || "",
      businessType: body.businessType || "",
      location: body.location || "",
      mainGoal: body.mainGoal || "",
      extraInfo: body.extraInfo || "",
      tone: body.tone ?? "friendly",
    };

    const description = await generateProjectDescriptionWithAI(input);

    return NextResponse.json({ description }, { status: 200 });
  } catch (error) {
    console.error("Error generating project description:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
