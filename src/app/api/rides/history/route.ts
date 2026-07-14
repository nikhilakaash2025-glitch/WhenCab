import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRides } from "@/lib/rides/rideService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rides = await getUserRides(session.user.id);
  return NextResponse.json(rides);
}
