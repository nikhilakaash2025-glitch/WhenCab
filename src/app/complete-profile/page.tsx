"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <p className="text-xs tracking-[0.3em] text-flare uppercase mb-2 font-semibold">One last step</p>
        <h1 className="font-display text-2xl text-cream mb-2">Add your number</h1>
        <p className="text-sm text-smoke mb-6 leading-relaxed">
          It stays private by default — rides are coordinated through in-app chat, not shown to other students.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            type="tel"
            placeholder="e.g. 9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-ink-surface border border-ink-border rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-smoke/50 focus:border-flare/60 outline-none transition"
          />
          {error && <p className="text-sm text-ember-bright">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black border-2 border-flare text-flare-bright rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-flare hover:text-black transition"
          >
            {submitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
