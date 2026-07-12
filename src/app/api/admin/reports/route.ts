import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { listPendingReports, listReportHistory } from "@/lib/admin/adminService";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");

  const reports = view === "history" ? await listReportHistory() : await listPendingReports();
  return NextResponse.json(reports);
}
