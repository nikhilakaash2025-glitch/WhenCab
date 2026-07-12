import { db } from "@/lib/db";
import { Ride, PostType, User } from "@prisma/client";

type RideWithUser = Ride & { user: Pick<User, "id" | "name"> };

/**
 * Given a newly created ride, find opposite-type rides that match on
 * destination + a ±2 hour time window. This is the sole entry point for
 * match detection — keep all matching logic here so a future WhatsApp
 * integration only ever needs to touch this file.
 */
export async function checkForMatches(newRide: RideWithUser) {
  const oppositeType: PostType = newRide.postType === "HAVE_CAB" ? "NEED_CAB" : "HAVE_CAB";

  const windowMs = 2 * 60 * 60 * 1000;
  const windowStart = new Date(newRide.travelDateTime.getTime() - windowMs);
  const windowEnd = new Date(newRide.travelDateTime.getTime() + windowMs);

  const candidates = await db.ride.findMany({
    where: {
      status: "ACTIVE",
      postType: oppositeType,
      destination: { equals: newRide.destination, mode: "insensitive" },
      travelDateTime: { gte: windowStart, lte: windowEnd },
      userId: { not: newRide.userId },
    },
    include: { user: { select: { id: true, name: true, phoneNumber: true } } },
  });

  for (const match of candidates) {
    await notifyMatch(newRide, match);
  }

  return candidates;
}

/**
 * Notification dispatcher — the ONLY function that needs to change when
 * the WhatsApp API is wired in. Swap the console.log for a fetch() to a
 * WhatsApp Business API / Twilio webhook, keeping the same signature.
 */
async function notifyMatch(rideA: RideWithUser, rideB: Ride & { user: { id: string; name: string; phoneNumber: string | null } }) {
  console.log(
    `[MATCH FOUND] ${rideA.user.name} (${rideA.postType}) <-> ` +
      `${rideB.user.name} (${rideB.postType}) for ${rideA.destination}`
  );

  // Future WhatsApp hook, e.g.:
  // await fetch(process.env.WHATSAPP_WEBHOOK_URL!, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     to: rideB.user.phoneNumber,
  //     template: "ride_match_found",
  //     params: { matchName: rideA.user.name },
  //   }),
  // });
}
