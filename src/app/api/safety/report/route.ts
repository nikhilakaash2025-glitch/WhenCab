import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reportUser } from "@/lib/safety/safetyService";
import { ReportReason } from "@prisma/client";
import { z } from "zod";

const reportSchema = z.object({
  reportedUserId: z.string(),
  reason: z.nativeEnum(ReportReason),
  details: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = reportSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const report = await reportUser(
      session.user.id,
      parsed.data.reportedUserId,
      parsed.data.reason,
      parsed.data.details
    );
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
