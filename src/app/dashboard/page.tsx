"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RideFilters, { Filters } from "@/components/RideFilters";
import RideCard from "@/components/RideCard";
import { useChat } from "@/context/ChatContext";

interface Ride {
  id: string;
  destination: string;
  travelDateTime: string;
  availableSeats: number;
  totalFare: number;
  postType: "HAVE_CAB" | "NEED_CAB";
  user: { id: string; name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { openConversation } = useChat();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRides = useCallback(async (filters?: Filters) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters?.destination) params.set("destination", filters.destination);
    if (filters?.postType) params.set("postType", filters.postType);

    if (filters?.date) {
      params.set(
        "dateFrom",
        new Date(`${filters.date}T${filters.timeFrom || "00:00"}`).toISOString()
      );
      params.set(
        "dateTo",
        new Date(`${filters.date}T${filters.timeTo || "23:59"}`).toISOString()
      );
    }

    try {
      const res = await fetch(`/api/rides?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load rides");
      setRides(await res.json());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  async function handleMessage(rideId: string) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId }),
    });

    if (res.ok) {
      const conversation = await res.json();
      openConversation(conversation.id);
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not start conversation");
    }
  }

  const needCabRides = rides.filter((r) => r.postType === "NEED_CAB");
  const haveCabRides = rides.filter((r) => r.postType === "HAVE_CAB");

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Find a Ride</h1>
        <button
          onClick={() => router.push("/dashboard/post-ride")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Post a Ride
        </button>
      </div>

      <RideFilters onSearch={fetchRides} />

      {loading && <p className="text-sm text-gray-500 text-center py-8">Loading rides...</p>}
      {error && <p className="text-sm text-red-600 text-center py-8">{error}</p>}

      {!loading && !error && rides.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          No rides match your search. Try widening the filters, or be the first to post.
        </p>
      )}

      {!loading && needCabRides.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Looking for a cab ({needCabRides.length})
          </h2>
          <div className="space-y-3">
            {needCabRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                currentUserId={session?.user?.id ?? ""}
                onMessage={handleMessage}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && haveCabRides.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Have a cab, need company ({haveCabRides.length})
          </h2>
          <div className="space-y-3">
            {haveCabRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                currentUserId={session?.user?.id ?? ""}
                onMessage={handleMessage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
