import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateConversation, getUserConversations } from "@/lib/chat/chatService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await getUserConversations(session.user.id);
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rideId } = await req.json();
  if (!rideId) return NextResponse.json({ error: "rideId is required" }, { status: 400 });

  try {
    const conversation = await getOrCreateConversation(rideId, session.user.id);
    return NextResponse.json(conversation, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
