import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { listSuspendedUsers } from "@/lib/admin/adminService";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listSuspendedUsers();
  return NextResponse.json(users);
}
