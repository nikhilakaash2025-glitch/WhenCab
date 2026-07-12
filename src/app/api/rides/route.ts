import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { searchRides, createRide } from "@/lib/rides/rideService";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const destination = searchParams.get("destination") ?? undefined;
  const postType = searchParams.get("postType") ?? undefined;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const rides = await searchRides({
    currentUserId: session.user.id,
    destination,
    postType: postType as "HAVE_CAB" | "NEED_CAB" | undefined,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  return NextResponse.json(rides);
}

const createRideSchema = z.object({
  destination: z.string().min(2).max(120),
  travelDateTime: z.string().datetime({ offset: true }),
  availableSeats: z.number().int().min(1).max(6),
  totalFare: z.number().positive(),
  postType: z.enum(["HAVE_CAB", "NEED_CAB"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createRideSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { destination, travelDateTime, availableSeats, totalFare, postType } = parsed.data;

  if (new Date(travelDateTime) <= new Date()) {
    return NextResponse.json(
      { error: "travelDateTime must be in the future" },
      { status: 400 }
    );
  }

  const ride = await createRide({
    userId: session.user.id,
    destination,
    travelDateTime: new Date(travelDateTime),
    availableSeats,
    totalFare,
    postType,
  });

  return NextResponse.json(ride, { status: 201 });
}
