"use client";

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
    <div className="border rounded-xl p-4 bg-white hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            ride.postType === "HAVE_CAB"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {ride.postType === "HAVE_CAB" ? "Has a Cab" : "Needs a Cab"}
        </span>
        <span className="text-sm font-semibold text-gray-900">₹{ride.totalFare}</span>
      </div>

      <h3 className="font-medium text-gray-900">{ride.destination}</h3>

      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
        <span>
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </span>
        <span>·</span>
        <span>
          {ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className="text-sm text-gray-600">{ride.user.name}</span>
        {!isOwnRide ? (
          <button
            onClick={() => onMessage(ride.id)}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium"
          >
            Message
          </button>
        ) : (
          <span className="text-xs text-gray-400">Your post</span>
        )}
      </div>
    </div>
  );
}
