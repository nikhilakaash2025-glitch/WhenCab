"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PostType = "HAVE_CAB" | "NEED_CAB";

export default function PostRidePage() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType | null>(null);
  const [form, setForm] = useState({
    destination: "",
    travelDateTime: "",
    availableSeats: 1,
    totalFare: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!postType) {
      setError("Please select whether you have a cab or need one.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const localDate = new Date(form.travelDateTime);
    const isoWithOffset = localDate.toISOString();

    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, travelDateTime: isoWithOffset, postType }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full bg-ink border border-ink-border rounded-lg px-3 py-2 text-sm text-cream placeholder:text-smoke/50 focus:border-flare/60 outline-none transition";

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-ink-surface rounded-xl border border-ink-border">
      <h1 className="font-display text-xl text-cream mb-6 tracking-wide">Post a Ride</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setPostType("HAVE_CAB")}
          className={`p-4 rounded-lg border-2 text-sm font-medium transition ${
            postType === "HAVE_CAB"
              ? "border-flare bg-flare/10 text-flare-bright"
              : "border-ink-border text-smoke hover:border-ink-border/80"
          }`}
        >
          I Have a Cab
        </button>
        <button
          type="button"
          onClick={() => setPostType("NEED_CAB")}
          className={`p-4 rounded-lg border-2 text-sm font-medium transition ${
            postType === "NEED_CAB"
              ? "border-ember bg-ember/10 text-ember-bright"
              : "border-ink-border text-smoke hover:border-ink-border/80"
          }`}
        >
          I Need a Cab
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-smoke">Destination</label>
          <input
            required
            type="text"
            placeholder="e.g. Bangalore Airport (KIA)"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-smoke">Travel Date & Time</label>
          <input
            required
            type="datetime-local"
            value={form.travelDateTime}
            onChange={(e) => setForm({ ...form, travelDateTime: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-smoke">
              {postType === "HAVE_CAB" ? "Seats Available" : "Seats Needed"}
            </label>
            <input
              required
              type="number"
              min={1}
              max={6}
              value={form.availableSeats}
              onChange={(e) => setForm({ ...form, availableSeats: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-smoke">
              {postType === "HAVE_CAB" ? "Fare per Seat (₹)" : "Budget per Seat (₹)"}
            </label>
            <input
              required
              type="number"
              min={0}
              value={form.totalFare}
              onChange={(e) => setForm({ ...form, totalFare: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-ember-bright">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black border-2 border-flare text-flare-bright rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-flare hover:text-black transition"
        >
          {submitting ? "Posting..." : "Post Ride"}
        </button>
      </form>
    </div>
  );
}
