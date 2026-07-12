import { NextRequest, NextResponse } from "next/server";
import { expireOverdueRides } from "@/lib/rides/rideService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await expireOverdueRides();
  return NextResponse.json({ expiredCount: result.count });
}
