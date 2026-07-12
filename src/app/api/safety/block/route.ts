import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blockUser, unblockUser, getBlockedUsers } from "@/lib/safety/safetyService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocked = await getBlockedUsers(session.user.id);
  return NextResponse.json(blocked);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: "blockedId is required" }, { status: 400 });

  try {
    await blockUser(session.user.id, blockedId);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: "blockedId is required" }, { status: 400 });

  await unblockUser(session.user.id, blockedId);
  return NextResponse.json({ success: true });
}
