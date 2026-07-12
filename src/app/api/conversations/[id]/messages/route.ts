import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMessages, sendMessage } from "@/lib/chat/chatService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const messages = await getMessages(params.id, session.user.id);
    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();

  try {
    const message = await sendMessage(params.id, session.user.id, content);
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
