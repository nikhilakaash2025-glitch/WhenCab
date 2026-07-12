"use client";

import { displayName } from "@/lib/displayName";

interface Ride {
  id: string;
  destination: string;
  travelDateTime: string;
  availableSeats: number;
  totalFare: number;
  postType: "HAVE_CAB" | "NEED_CAB";
  user: { id: string; name: string };
}

export default function RideCard({
  ride,
  currentUserId,
  onMessage,
}: {
  ride: Ride;
  currentUserId: string;
  onMessage: (rideId: string) => void;
}) {
  const isOwnRide = ride.user.id === currentUserId;
  const date = new Date(ride.travelDateTime);

  return (
    <div className="border border-ink-border rounded-xl p-4 bg-ink-surface hover:border-flare/40 transition">
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            ride.postType === "HAVE_CAB"
              ? "bg-flare/15 text-flare-bright"
              : "bg-ember/15 text-ember-bright"
          }`}
        >
          {ride.postType === "HAVE_CAB" ? "Has a Cab" : "Needs a Cab"}
        </span>
        <span className="text-sm font-semibold text-cream">₹{ride.totalFare}</span>
      </div>

      <h3 className="font-display text-base tracking-wide text-cream">{ride.destination}</h3>

      <div className="flex items-center gap-3 text-sm text-smoke mt-1">
        <span>
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </span>
        <span>·</span>
        <span>
          {ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-border">
        <span className="text-sm text-smoke">{displayName(ride.user.name)}</span>
        {!isOwnRide ? (
          <button
            onClick={() => onMessage(ride.id)}
            className="text-sm bg-black text-flare-bright border border-flare/50 px-3 py-1.5 rounded-lg font-medium hover:bg-flare hover:text-black hover:border-flare transition wc-focus"
          >
            Message
          </button>
        ) : (
          <span className="text-xs text-smoke/60">Your post</span>
        )}
      </div>
    </div>
  );
}
