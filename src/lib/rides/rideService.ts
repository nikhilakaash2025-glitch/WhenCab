import { db } from "@/lib/db";
import { PostType, Prisma } from "@prisma/client";

interface SearchRidesInput {
  currentUserId: string;
  destination?: string;
  postType?: PostType;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function searchRides({
  currentUserId,
  destination,
  postType,
  dateFrom,
  dateTo,
}: SearchRidesInput) {
  // Never show rides from someone the current user has blocked, or who
  // has blocked the current user, in either direction.
  const blocks = await db.block.findMany({
    where: { OR: [{ blockerId: currentUserId }, { blockedId: currentUserId }] },
    select: { blockerId: true, blockedId: true },
  });
  const excludedUserIds = blocks.map((b) =>
    b.blockerId === currentUserId ? b.blockedId : b.blockerId
  );

  const where: Prisma.RideWhereInput = {
    status: "ACTIVE",
    ...(excludedUserIds.length > 0 && { userId: { notIn: excludedUserIds } }),
    ...(destination && {
      destination: { contains: destination, mode: "insensitive" },
    }),
    ...(postType && { postType }),
    ...((dateFrom || dateTo) && {
      travelDateTime: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    }),
  };

  return db.ride.findMany({
    where,
    orderBy: { travelDateTime: "asc" },
    include: {
      // phoneNumber intentionally excluded — chat replaces direct contact info
      user: { select: { id: true, name: true } },
    },
  });
}

interface CreateRideInput {
  userId: string;
  destination: string;
  travelDateTime: Date;
  availableSeats: number;
  totalFare: number;
  postType: PostType;
}

export async function createRide(input: CreateRideInput) {
  const ride = await db.ride.create({
    data: input,
    include: { user: { select: { id: true, name: true } } },
  });

  // Fire-and-forget match check — isolated so the future WhatsApp hook
  // only ever needs to touch matchService.ts, nothing here.
  import("@/lib/rides/matchService").then(({ checkForMatches }) => {
    checkForMatches(ride).catch((err) => console.error("Match check failed:", err));
  });

  return ride;
}

export async function expireOverdueRides() {
  return db.ride.updateMany({
    where: { status: "ACTIVE", travelDateTime: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
}
