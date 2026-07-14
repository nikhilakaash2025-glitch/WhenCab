"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Ride {
  id: string;
  destination: string;
  travelDateTime: string;
  availableSeats: number;
  totalFare: number;
  postType: "HAVE_CAB" | "NEED_CAB";
  status: "ACTIVE" | "EXPIRED";
}

export default function HistoryPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/rides/history");
        if (!res.ok) throw new Error("Failed to load history");
        setRides(await res.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Back to dashboard"
          className="text-smoke hover:text-cream transition text-sm"
        >
          ← Back
        </button>
        <h1 className="font-display text-xl text-cream tracking-wide">History of Posts</h1>
      </div>

      {loading && <p className="text-sm text-smoke text-center py-8">Loading your posts...</p>}
      {error && <p className="text-sm text-ember-bright text-center py-8">{error}</p>}
      {!loading && !error && rides.length === 0 && (
        <p className="text-sm text-smoke text-center py-8">
          You haven&apos;t posted any rides yet.
        </p>
      )}

      <div className="space-y-3">
        {rides.map((ride) => {
          const date = new Date(ride.travelDateTime);
          const isExpired = ride.status === "EXPIRED";

          return (
            <div
              key={ride.id}
              className={`border border-ink-border rounded-xl p-4 bg-ink-surface ${
                isExpired ? "opacity-60" : ""
              }`}
            >
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
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isExpired ? "bg-ink-border text-smoke" : "bg-flare/10 text-flare"
                  }`}
                >
                  {isExpired ? "Expired" : "Active"}
                </span>
              </div>

              <h3 className="font-display text-base tracking-wide text-cream">
                {ride.destination}
              </h3>

              <div className="flex items-center gap-3 text-sm text-smoke mt-1 flex-wrap">
                <span>
                  {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                  {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </span>
                <span>·</span>
                <span>
                  {ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""}
                </span>
                <span>·</span>
                <span>₹{ride.totalFare}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
